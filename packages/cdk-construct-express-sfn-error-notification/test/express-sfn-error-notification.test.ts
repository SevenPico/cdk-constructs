import { App, Stack } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { makeContext } from '@sevenpico/cdk-context';
import { ExpressSfnErrorNotification } from '../src/express-sfn-error-notification';
import { ExpressSfnErrorNotificationProps } from '../src/express-sfn-error-notification-types';

const makeStack = (): Stack => {
  const app = new App();
  return new Stack(app, 'TestStack');
};

const twoMachineProps = (overrides?: Partial<ExpressSfnErrorNotificationProps>): ExpressSfnErrorNotificationProps => ({
  context: makeContext({ namespace: '7p', stage: 'prod', name: 'monitor' }),
  stepFunctions: {
    orders: { arn: 'arn:aws:states:us-east-1:123456789012:stateMachine:orders' },
    payments: { arn: 'arn:aws:states:us-east-1:123456789012:stateMachine:payments' },
  },
  rateAlarmSnsTopicArn: 'arn:aws:sns:us-east-1:123456789012:rate-topic',
  volumeAlarmSnsTopicArn: 'arn:aws:sns:us-east-1:123456789012:volume-topic',
  ...overrides,
});

const singleMachineProps = (overrides?: Partial<ExpressSfnErrorNotificationProps>): ExpressSfnErrorNotificationProps => ({
  context: makeContext({ namespace: '7p', stage: 'prod', name: 'monitor' }),
  stepFunctions: {
    orders: { arn: 'arn:aws:states:us-east-1:123456789012:stateMachine:orders' },
  },
  rateAlarmSnsTopicArn: 'arn:aws:sns:us-east-1:123456789012:rate-topic',
  volumeAlarmSnsTopicArn: 'arn:aws:sns:us-east-1:123456789012:volume-topic',
  ...overrides,
});

describe('ExpressSfnErrorNotification construct', () => {
  describe('Feature: Per-Machine Resource Creation', () => {
    test('One DLQ created per step function', () => {
      const stack = makeStack();
      new ExpressSfnErrorNotification(stack, 'SUT', twoMachineProps());
      const template = Template.fromStack(stack);
      template.resourceCountIs('AWS::SQS::Queue', 2);
    });

    test('DLQ names include machine key', () => {
      const stack = makeStack();
      new ExpressSfnErrorNotification(stack, 'SUT', singleMachineProps());
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::SQS::Queue', {
        QueueName: '7p-prod-monitor-orders-dlq',
      });
    });

    test('One pipe created per step function', () => {
      const stack = makeStack();
      new ExpressSfnErrorNotification(stack, 'SUT', twoMachineProps());
      const template = Template.fromStack(stack);
      template.resourceCountIs('AWS::Pipes::Pipe', 2);
    });

    test('Two rate alarms and two volume alarms for two machines', () => {
      const stack = makeStack();
      new ExpressSfnErrorNotification(stack, 'SUT', twoMachineProps());
      const template = Template.fromStack(stack);
      template.resourceCountIs('AWS::CloudWatch::Alarm', 4);
    });
  });

  describe('Feature: Express Alarm Defaults', () => {
    test('Alarms use lighter thresholds (1 datapoint / 5 periods)', () => {
      const stack = makeStack();
      new ExpressSfnErrorNotification(stack, 'SUT', singleMachineProps());
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::CloudWatch::Alarm', {
        DatapointsToAlarm: 1,
        EvaluationPeriods: 5,
      });
    });

    test('DLQs use 30-second visibility timeout by default', () => {
      const stack = makeStack();
      new ExpressSfnErrorNotification(stack, 'SUT', singleMachineProps());
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::SQS::Queue', {
        VisibilityTimeout: 30,
      });
    });

    test('DLQs use 7-day retention by default', () => {
      const stack = makeStack();
      new ExpressSfnErrorNotification(stack, 'SUT', singleMachineProps());
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::SQS::Queue', {
        MessageRetentionPeriod: 604800,
      });
    });
  });

  describe('Feature: Pipe Configuration', () => {
    test('Pipe name includes machine key', () => {
      const stack = makeStack();
      new ExpressSfnErrorNotification(stack, 'SUT', singleMachineProps());
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::Pipes::Pipe', {
        Name: '7p-prod-monitor-orders-pipe',
      });
    });

    test('Pipe target is the state machine ARN', () => {
      const stack = makeStack();
      new ExpressSfnErrorNotification(stack, 'SUT', singleMachineProps());
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::Pipes::Pipe', {
        Target: 'arn:aws:states:us-east-1:123456789012:stateMachine:orders',
      });
    });
  });

  describe('Feature: Tagging', () => {
    test('Context tags applied to resources', () => {
      const stack = makeStack();
      new ExpressSfnErrorNotification(stack, 'SUT', singleMachineProps({
        context: makeContext({ namespace: '7p', stage: 'prod', name: 'monitor', tags: { Env: 'production' } }),
      }));
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
      const stack = makeStack();
      new ExpressSfnErrorNotification(stack, 'SUT', singleMachineProps({
        context: makeContext({ namespace: '7p', stage: 'test', name: 'test', enabled: false }),
      }));
      const template = Template.fromStack(stack);
      expect(Object.keys(template.toJSON().Resources ?? {})).toHaveLength(0);
    });
  });
});
