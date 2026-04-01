import { App, Stack } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { makeContext, Context } from '@sevenpico/cdk-context';
import { loadFeature, defineFeature } from 'jest-cucumber';
import path from 'path';
import { Sns } from '../src/sns';
import { SnsProps } from '../src/sns-types';

const feature = loadFeature(path.join(__dirname, 'sns.feature'));

const makeStack = (): Stack => {
  const app = new App();
  return new Stack(app, 'TestStack');
};

defineFeature(feature, (test: any) => {
  let context: Context;
  let stack: Stack;
  let template: Template;
  let extraProps: Partial<SnsProps>;

  test('Topic name uses context ID', ({ given, when, then }: any) => {
    given(/^a context with namespace "(.+)", stage "(.+)", name "(.+)"$/, (ns: string, stage: string, name: string) => {
      context = makeContext({ namespace: ns, stage, name });
      extraProps = {};
    });
    when('an Sns construct is created', () => {
      stack = makeStack();
      new Sns(stack, 'SUT', { context, ...extraProps } as SnsProps);
      template = Template.fromStack(stack);
    });
    then(/^an SNS Topic exists with TopicName "(.+)"$/, (topicName: string) => {
      template.hasResourceProperties('AWS::SNS::Topic', {
        TopicName: topicName,
      });
    });
  });

  test('FIFO topic name appends .fifo suffix', ({ given, when, then }: any) => {
    given(/^a context with namespace "(.+)", stage "(.+)", name "(.+)" and fifoTopic true$/, (ns: string, stage: string, name: string) => {
      context = makeContext({ namespace: ns, stage, name });
      extraProps = { fifoTopic: true };
    });
    when('an Sns construct is created', () => {
      stack = makeStack();
      new Sns(stack, 'SUT', { context, ...extraProps } as SnsProps);
      template = Template.fromStack(stack);
    });
    then(/^an SNS Topic exists with TopicName "(.+)"$/, (topicName: string) => {
      template.hasResourceProperties('AWS::SNS::Topic', {
        TopicName: topicName,
      });
    });
  });

  test('DLQ created when sqsDlqEnabled is true', ({ given, when, then }: any) => {
    given('a context with sqsDlqEnabled true', () => {
      context = makeContext({ namespace: '7p', stage: 'prod', name: 'alerts' });
      extraProps = { sqsDlqEnabled: true };
    });
    when('an Sns construct is created', () => {
      stack = makeStack();
      new Sns(stack, 'SUT', { context, ...extraProps } as SnsProps);
      template = Template.fromStack(stack);
    });
    then('an SQS Queue resource exists for dead letter messages', () => {
      template.resourceCountIs('AWS::SQS::Queue', 1);
    });
  });

  test('Context tags applied to topic', ({ given, when, then }: any) => {
    given(/^a context with tags Env "(.+)"$/, (envTag: string) => {
      context = makeContext({ namespace: '7p', stage: 'prod', name: 'alerts', tags: { Env: envTag } });
      extraProps = {};
    });
    when('an Sns construct is created', () => {
      stack = makeStack();
      new Sns(stack, 'SUT', { context, ...extraProps } as SnsProps);
      template = Template.fromStack(stack);
    });
    then(/^the SNS topic has the tag Env "(.+)"$/, (envTag: string) => {
      template.hasResourceProperties('AWS::SNS::Topic', {
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
    when('an Sns construct is created', () => {
      stack = makeStack();
      new Sns(stack, 'SUT', { context, ...extraProps } as SnsProps);
      template = Template.fromStack(stack);
    });
    then('no SNS Topic resources exist in the stack', () => {
      template.resourceCountIs('AWS::SNS::Topic', 0);
    });
  });
});
