import { App, Stack } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { makeContext, Context } from '@sevenpico/cdk-context';
import { loadFeature, defineFeature } from 'jest-cucumber';
import path from 'path';
import { SqsQueue } from '../src/sqs-queue';
import { SqsQueueProps } from '../src/sqs-queue-types';

const feature = loadFeature(path.join(__dirname, 'sqs-queue.feature'));

const makeStack = (): Stack => {
  const app = new App();
  return new Stack(app, 'TestStack');
};

defineFeature(feature, (test: any) => {
  let context: Context;
  let stack: Stack;
  let template: Template;
  let extraProps: Partial<SqsQueueProps>;

  test('Queue name uses context ID', ({ given, when, then }: any) => {
    given(/^a context with namespace "(.+)", stage "(.+)", name "(.+)"$/, (ns: string, stage: string, name: string) => {
      context = makeContext({ namespace: ns, stage, name });
      extraProps = {};
    });
    when('an SqsQueue construct is created', () => {
      stack = makeStack();
      new SqsQueue(stack, 'SUT', { context, ...extraProps } as SqsQueueProps);
      template = Template.fromStack(stack);
    });
    then(/^an SQS Queue exists with QueueName "(.+)"$/, (queueName: string) => {
      template.hasResourceProperties('AWS::SQS::Queue', {
        QueueName: queueName,
      });
    });
  });

  test('FIFO queue name appends .fifo suffix', ({ given, when, then }: any) => {
    given(/^a context with namespace "(.+)", stage "(.+)", name "(.+)" and fifo true$/, (ns: string, stage: string, name: string) => {
      context = makeContext({ namespace: ns, stage, name });
      extraProps = { fifo: true };
    });
    when('an SqsQueue construct is created', () => {
      stack = makeStack();
      new SqsQueue(stack, 'SUT', { context, ...extraProps } as SqsQueueProps);
      template = Template.fromStack(stack);
    });
    then(/^an SQS Queue exists with QueueName "(.+)"$/, (queueName: string) => {
      template.hasResourceProperties('AWS::SQS::Queue', {
        QueueName: queueName,
      });
    });
  });

  test('DLQ created when dlqEnabled is true', ({ given, when, then }: any) => {
    given('a context with dlqEnabled true', () => {
      context = makeContext({ namespace: '7p', stage: 'prod', name: 'orders' });
      extraProps = { dlqEnabled: true };
    });
    when('an SqsQueue construct is created', () => {
      stack = makeStack();
      new SqsQueue(stack, 'SUT', { context, ...extraProps } as SqsQueueProps);
      template = Template.fromStack(stack);
    });
    then('two SQS Queue resources exist in the stack', () => {
      template.resourceCountIs('AWS::SQS::Queue', 2);
    });
  });

  test('No DLQ when dlqEnabled is false', ({ given, when, then }: any) => {
    given('a context with dlqEnabled false', () => {
      context = makeContext({ namespace: '7p', stage: 'prod', name: 'orders' });
      extraProps = { dlqEnabled: false };
    });
    when('an SqsQueue construct is created', () => {
      stack = makeStack();
      new SqsQueue(stack, 'SUT', { context, ...extraProps } as SqsQueueProps);
      template = Template.fromStack(stack);
    });
    then('only one SQS Queue resource exists', () => {
      template.resourceCountIs('AWS::SQS::Queue', 1);
    });
  });

  test('Context tags applied to queue', ({ given, when, then }: any) => {
    given(/^a context with tags Env "(.+)"$/, (envTag: string) => {
      context = makeContext({ namespace: '7p', stage: 'prod', name: 'orders', tags: { Env: envTag } });
      extraProps = {};
    });
    when('an SqsQueue construct is created', () => {
      stack = makeStack();
      new SqsQueue(stack, 'SUT', { context, ...extraProps } as SqsQueueProps);
      template = Template.fromStack(stack);
    });
    then(/^the SQS queue has the tag Env "(.+)"$/, (envTag: string) => {
      template.hasResourceProperties('AWS::SQS::Queue', {
        Tags: Match.arrayWith([
          Match.objectLike({ Key: 'Env', Value: envTag }),
        ]),
      });
    });
  });

  test('No resources created when context is disabled', ({ given, when, then }: any) => {
    given('a context with enabled false', () => {
      context = makeContext({ namespace: '7p', stage: 'test', name: 'test', enabled: false });
      extraProps = {};
    });
    when('an SqsQueue construct is created', () => {
      stack = makeStack();
      new SqsQueue(stack, 'SUT', { context, ...extraProps } as SqsQueueProps);
      template = Template.fromStack(stack);
    });
    then('no SQS Queue resources exist in the stack', () => {
      template.resourceCountIs('AWS::SQS::Queue', 0);
    });
  });
});
