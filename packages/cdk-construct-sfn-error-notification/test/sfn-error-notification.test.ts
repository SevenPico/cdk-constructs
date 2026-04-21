import { makeContext } from '@sevenpico/cdk-context';
import { App, Stack } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { SfnErrorNotification } from '../src/sfn-error-notification';
import { SfnErrorNotificationProps } from '../src/sfn-error-notification-types';

const makeStack = (): Stack => {
  const app = new App();
  return new Stack(app, 'TestStack');
};

const baseProps = (overrides?: Partial<SfnErrorNotificationProps>): SfnErrorNotificationProps => ({
  context: makeContext({ namespace: '7p', stage: 'prod', name: 'workflow' }),
  stateMachineArn: 'arn:aws:states:us-east-1:123456789012:stateMachine:my-sfn',
  rateAlarmSnsTopicArn: 'arn:aws:sns:us-east-1:123456789012:rate-topic',
  volumeAlarmSnsTopicArn: 'arn:aws:sns:us-east-1:123456789012:volume-topic',
  ...overrides,
});

describe('SfnErrorNotification construct', () => {
  describe('Feature: DLQ Naming', () => {
    test('DLQ name derived from context with dlq attribute', () => {
      const stack = makeStack();
      new SfnErrorNotification(stack, 'SUT', baseProps());
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::SQS::Queue', {
        QueueName: '7p-prod-workflow-dlq',
      });
    });

    test('DLQ uses 7-day retention by default', () => {
      const stack = makeStack();
      new SfnErrorNotification(stack, 'SUT', baseProps());
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::SQS::Queue', {
        MessageRetentionPeriod: 604800,
      });
    });
  });

  describe('Feature: Failed Execution Capture', () => {
    test('EventBridge rule is created', () => {
      const stack = makeStack();
      new SfnErrorNotification(stack, 'SUT', baseProps());
      const template = Template.fromStack(stack);
      template.resourceCountIs('AWS::Events::Rule', 1);
    });

    test('EventBridge rule name derived from context', () => {
      const stack = makeStack();
      new SfnErrorNotification(stack, 'SUT', baseProps());
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::Events::Rule', {
        Name: '7p-prod-workflow-failed',
      });
    });

    test('EventBridge rule captures FAILED, TIMED_OUT, and ABORTED executions', () => {
      const stack = makeStack();
      new SfnErrorNotification(stack, 'SUT', baseProps());
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::Events::Rule', {
        EventPattern: Match.objectLike({
          'source': ['aws.states'],
          'detail-type': ['Step Functions Execution Status Change'],
          'detail': {
            status: ['FAILED', 'TIMED_OUT', 'ABORTED'],
            stateMachineArn: ['arn:aws:states:us-east-1:123456789012:stateMachine:my-sfn'],
          },
        }),
      });
    });
  });

  describe('Feature: Alarm Defaults', () => {
    test('Standard SFN alarms use 2 datapoints over 2 periods', () => {
      const stack = makeStack();
      new SfnErrorNotification(stack, 'SUT', baseProps());
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::CloudWatch::Alarm', {
        AlarmName: '7p-prod-workflow-dlq-rate',
        DatapointsToAlarm: 2,
        EvaluationPeriods: 2,
      });
      template.hasResourceProperties('AWS::CloudWatch::Alarm', {
        AlarmName: '7p-prod-workflow-dlq-volume',
        DatapointsToAlarm: 2,
        EvaluationPeriods: 2,
      });
    });

    test('Both rate and volume alarms are created', () => {
      const stack = makeStack();
      new SfnErrorNotification(stack, 'SUT', baseProps());
      const template = Template.fromStack(stack);
      template.resourceCountIs('AWS::CloudWatch::Alarm', 2);
    });
  });

  describe('Feature: Reprocessing Pipe', () => {
    test('EventBridge Pipe is created', () => {
      const stack = makeStack();
      new SfnErrorNotification(stack, 'SUT', baseProps());
      const template = Template.fromStack(stack);
      template.resourceCountIs('AWS::Pipes::Pipe', 1);
    });

    test('Pipe name derived from context', () => {
      const stack = makeStack();
      new SfnErrorNotification(stack, 'SUT', baseProps());
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::Pipes::Pipe', {
        Name: '7p-prod-workflow-pipe',
      });
    });

    test('Pipe target is the state machine ARN', () => {
      const stack = makeStack();
      new SfnErrorNotification(stack, 'SUT', baseProps());
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::Pipes::Pipe', {
        Target: 'arn:aws:states:us-east-1:123456789012:stateMachine:my-sfn',
      });
    });
  });

  describe('Feature: Tagging', () => {
    test('Context tags applied to resources', () => {
      const stack = makeStack();
      new SfnErrorNotification(stack, 'SUT', baseProps({
        context: makeContext({ namespace: '7p', stage: 'prod', name: 'workflow', tags: { Env: 'production' } }),
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
      new SfnErrorNotification(stack, 'SUT', baseProps({
        context: makeContext({ namespace: '7p', stage: 'test', name: 'test', enabled: false }),
      }));
      const template = Template.fromStack(stack);
      expect(Object.keys(template.toJSON().Resources ?? {})).toHaveLength(0);
    });
  });
});
