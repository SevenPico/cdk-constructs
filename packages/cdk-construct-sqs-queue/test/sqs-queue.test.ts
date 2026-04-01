import { App, Stack } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { makeContext } from '@sevenpico/cdk-context';
import { SqsQueue } from '../src/sqs-queue';

const makeStack = (): Stack => {
  const app = new App();
  return new Stack(app, 'TestStack');
};

describe('SqsQueue construct', () => {
  describe('Feature: Queue Naming', () => {
    test('Queue name uses context ID', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'orders' });
      const stack = makeStack();
      new SqsQueue(stack, 'SUT', { context });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::SQS::Queue', {
        QueueName: '7p-prod-orders',
      });
    });

    test('FIFO queue name appends .fifo suffix', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'orders' });
      const stack = makeStack();
      new SqsQueue(stack, 'SUT', { context, fifo: true });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::SQS::Queue', {
        QueueName: '7p-prod-orders.fifo',
        FifoQueue: true,
      });
    });
  });

  describe('Feature: Dead Letter Queue', () => {
    test('DLQ created with context-derived name', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'orders' });
      const stack = makeStack();
      new SqsQueue(stack, 'SUT', { context, dlqEnabled: true });
      const template = Template.fromStack(stack);
      template.resourceCountIs('AWS::SQS::Queue', 2);
      template.hasResourceProperties('AWS::SQS::Queue', {
        QueueName: '7p-prod-orders-dlq',
      });
    });

    test('Main queue has redrive policy pointing to DLQ', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'orders' });
      const stack = makeStack();
      new SqsQueue(stack, 'SUT', { context, dlqEnabled: true });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::SQS::Queue', {
        QueueName: '7p-prod-orders',
        RedrivePolicy: Match.objectLike({
          maxReceiveCount: 5,
        }),
      });
    });

    test('No DLQ when dlqEnabled is false', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'orders' });
      const stack = makeStack();
      new SqsQueue(stack, 'SUT', { context, dlqEnabled: false });
      const template = Template.fromStack(stack);
      template.resourceCountIs('AWS::SQS::Queue', 1);
    });

    test('Custom DLQ max receive count', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'orders' });
      const stack = makeStack();
      new SqsQueue(stack, 'SUT', { context, dlqEnabled: true, dlqMaxReceiveCount: 10 });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::SQS::Queue', {
        QueueName: '7p-prod-orders',
        RedrivePolicy: Match.objectLike({
          maxReceiveCount: 10,
        }),
      });
    });
  });

  describe('Feature: Encryption', () => {
    test('SQS-managed encryption by default', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'orders' });
      const stack = makeStack();
      new SqsQueue(stack, 'SUT', { context });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::SQS::Queue', {
        SqsManagedSseEnabled: true,
      });
    });

    test('KMS encryption when kmsMasterKeyId provided', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'orders' });
      const stack = makeStack();
      new SqsQueue(stack, 'SUT', {
        context,
        kmsMasterKeyId: 'arn:aws:kms:us-east-1:123456789:key/test-key-id',
      });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::SQS::Queue', {
        KmsMasterKeyId: Match.anyValue(),
      });
    });
  });

  describe('Feature: Visibility Timeout', () => {
    test('Visibility timeout defaults to 30 seconds', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'orders' });
      const stack = makeStack();
      new SqsQueue(stack, 'SUT', { context });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::SQS::Queue', {
        VisibilityTimeout: 30,
      });
    });

    test('Custom visibility timeout', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'orders' });
      const stack = makeStack();
      new SqsQueue(stack, 'SUT', { context, visibilityTimeoutSeconds: 120 });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::SQS::Queue', {
        VisibilityTimeout: 120,
      });
    });
  });

  describe('Feature: Tagging', () => {
    test('Context tags applied to queue', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'orders', tags: { Env: 'production' } });
      const stack = makeStack();
      new SqsQueue(stack, 'SUT', { context });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::SQS::Queue', {
        Tags: Match.arrayWith([
          Match.objectLike({ Key: 'Env', Value: 'production' }),
        ]),
      });
    });
  });

  describe('Feature: Disabled Construct', () => {
    test('No resources created when context is disabled', () => {
      const context = makeContext({ namespace: '7p', stage: 'test', name: 'test', enabled: false });
      const stack = makeStack();
      new SqsQueue(stack, 'SUT', { context });
      const template = Template.fromStack(stack);
      template.resourceCountIs('AWS::SQS::Queue', 0);
    });
  });

  describe('Feature: Queue Configuration', () => {
    test('Message retention period is set', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'orders' });
      const stack = makeStack();
      new SqsQueue(stack, 'SUT', { context, messageRetentionSeconds: 86400 });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::SQS::Queue', {
        MessageRetentionPeriod: 86400,
      });
    });

    test('Content-based deduplication for FIFO', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'orders' });
      const stack = makeStack();
      new SqsQueue(stack, 'SUT', { context, fifo: true, contentBasedDeduplication: true });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::SQS::Queue', {
        FifoQueue: true,
        ContentBasedDeduplication: true,
      });
    });

    test('Delay seconds is set', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'orders' });
      const stack = makeStack();
      new SqsQueue(stack, 'SUT', { context, delaySeconds: 60 });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::SQS::Queue', {
        DelaySeconds: 60,
      });
    });
  });
});
