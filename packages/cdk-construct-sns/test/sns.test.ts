import { App, Stack } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { makeContext } from '@sevenpico/cdk-context';
import { Sns } from '../src/sns';

const makeStack = (): Stack => {
  const app = new App();
  return new Stack(app, 'TestStack');
};

describe('Sns construct', () => {
  describe('Feature: Topic Naming', () => {
    test('Topic name uses context ID', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'alerts' });
      const stack = makeStack();
      new Sns(stack, 'SUT', { context });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::SNS::Topic', {
        TopicName: '7p-prod-alerts',
      });
    });

    test('FIFO topic name appends .fifo suffix', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'alerts' });
      const stack = makeStack();
      new Sns(stack, 'SUT', { context, fifoTopic: true });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::SNS::Topic', {
        TopicName: '7p-prod-alerts.fifo',
        FifoTopic: true,
      });
    });
  });

  describe('Feature: Subscriptions', () => {
    test('SQS subscription wired to topic', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'alerts' });
      const stack = makeStack();
      new Sns(stack, 'SUT', {
        context,
        subscribers: {
          queue1: {
            protocol: 'sqs',
            endpoint: 'arn:aws:sqs:us-east-1:123456789:my-queue',
          },
        },
      });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::SNS::Subscription', {
        Protocol: 'sqs',
        Endpoint: 'arn:aws:sqs:us-east-1:123456789:my-queue',
      });
    });

    test('Lambda subscription wired to topic', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'alerts' });
      const stack = makeStack();
      new Sns(stack, 'SUT', {
        context,
        subscribers: {
          func1: {
            protocol: 'lambda',
            endpoint: 'arn:aws:lambda:us-east-1:123456789:function:my-fn',
          },
        },
      });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::SNS::Subscription', {
        Protocol: 'lambda',
        Endpoint: 'arn:aws:lambda:us-east-1:123456789:function:my-fn',
      });
    });

    test('HTTPS subscription wired to topic', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'alerts' });
      const stack = makeStack();
      new Sns(stack, 'SUT', {
        context,
        subscribers: {
          webhook: {
            protocol: 'https',
            endpoint: 'https://example.com/webhook',
          },
        },
      });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::SNS::Subscription', {
        Protocol: 'https',
        Endpoint: 'https://example.com/webhook',
      });
    });

    test('Email subscription wired to topic', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'alerts' });
      const stack = makeStack();
      new Sns(stack, 'SUT', {
        context,
        subscribers: {
          admin: {
            protocol: 'email',
            endpoint: 'admin@example.com',
          },
        },
      });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::SNS::Subscription', {
        Protocol: 'email',
        Endpoint: 'admin@example.com',
      });
    });
  });

  describe('Feature: Dead Letter Queue', () => {
    test('DLQ created for failed deliveries when enabled', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'alerts' });
      const stack = makeStack();
      new Sns(stack, 'SUT', { context, sqsDlqEnabled: true });
      const template = Template.fromStack(stack);
      template.resourceCountIs('AWS::SQS::Queue', 1);
      template.hasResourceProperties('AWS::SQS::Queue', {
        QueueName: '7p-prod-alerts-dlq',
      });
    });

    test('No DLQ when sqsDlqEnabled is false', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'alerts' });
      const stack = makeStack();
      new Sns(stack, 'SUT', { context });
      const template = Template.fromStack(stack);
      template.resourceCountIs('AWS::SQS::Queue', 0);
    });
  });

  describe('Feature: Encryption', () => {
    test('KMS encryption applied when encryptionEnabled and kmsMasterKeyId provided', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'alerts' });
      const stack = makeStack();
      new Sns(stack, 'SUT', {
        context,
        encryptionEnabled: true,
        kmsMasterKeyId: 'arn:aws:kms:us-east-1:123456789:key/test-key-id',
      });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::SNS::Topic', {
        KmsMasterKeyId: Match.anyValue(),
      });
    });

    test('No KMS encryption when encryptionEnabled is false', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'alerts' });
      const stack = makeStack();
      new Sns(stack, 'SUT', { context, encryptionEnabled: false });
      const template = Template.fromStack(stack);
      const resources = template.toJSON().Resources;
      const topicResource = Object.values(resources).find(
        (r: any) => (r as any).Type === 'AWS::SNS::Topic',
      ) as any;
      expect(topicResource.Properties.KmsMasterKeyId).toBeUndefined();
    });
  });

  describe('Feature: Access Policy', () => {
    test('Publish permission granted to service principal', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'alerts' });
      const stack = makeStack();
      new Sns(stack, 'SUT', {
        context,
        allowedAwsServicesForPublish: ['events.amazonaws.com'],
      });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::SNS::TopicPolicy', {
        PolicyDocument: Match.objectLike({
          Statement: Match.arrayWith([
            Match.objectLike({
              Principal: Match.objectLike({
                Service: 'events.amazonaws.com',
              }),
            }),
          ]),
        }),
      });
    });

    test('Publish permission granted to IAM ARN', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'alerts' });
      const stack = makeStack();
      new Sns(stack, 'SUT', {
        context,
        allowedIamArnsForPublish: ['arn:aws:iam::123456789:role/publisher'],
      });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::SNS::TopicPolicy', {
        PolicyDocument: Match.objectLike({
          Statement: Match.arrayWith([
            Match.objectLike({
              Principal: Match.objectLike({
                AWS: 'arn:aws:iam::123456789:role/publisher',
              }),
            }),
          ]),
        }),
      });
    });

    test('Custom topic policy overrides generated policy', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'alerts' });
      const stack = makeStack();
      const customPolicy = JSON.stringify({
        Version: '2012-10-17',
        Statement: [{
          Sid: 'CustomPolicy',
          Effect: 'Allow',
          Principal: { AWS: '*' },
          Action: 'SNS:Publish',
          Resource: '*',
        }],
      });
      new Sns(stack, 'SUT', {
        context,
        snsTopicPolicyJson: customPolicy,
      });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::SNS::TopicPolicy', {
        PolicyDocument: Match.objectLike({
          Statement: Match.arrayWith([
            Match.objectLike({
              Sid: 'CustomPolicy',
            }),
          ]),
        }),
      });
    });
  });

  describe('Feature: Tagging', () => {
    test('Context tags applied to topic', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'alerts', tags: { Env: 'production' } });
      const stack = makeStack();
      new Sns(stack, 'SUT', { context });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::SNS::Topic', {
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
      new Sns(stack, 'SUT', { context });
      const template = Template.fromStack(stack);
      template.resourceCountIs('AWS::SNS::Topic', 0);
    });
  });

  describe('Feature: FIFO Configuration', () => {
    test('Content-based deduplication for FIFO', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'alerts' });
      const stack = makeStack();
      new Sns(stack, 'SUT', {
        context,
        fifoTopic: true,
        contentBasedDeduplication: true,
      });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::SNS::Topic', {
        FifoTopic: true,
        ContentBasedDeduplication: true,
      });
    });
  });
});
