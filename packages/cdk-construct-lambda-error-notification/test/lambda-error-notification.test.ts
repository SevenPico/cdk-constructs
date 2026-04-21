import { makeContext } from '@sevenpico/cdk-context';
import { App, Stack } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { LambdaErrorNotification } from '../src/lambda-error-notification';
import { LambdaErrorNotificationProps } from '../src/lambda-error-notification-types';

const makeStack = (): Stack => {
  const app = new App();
  return new Stack(app, 'TestStack');
};

const baseProps = (overrides?: Partial<LambdaErrorNotificationProps>): LambdaErrorNotificationProps => ({
  context: makeContext({ namespace: '7p', stage: 'prod', name: 'processor' }),
  lambdaArn: 'arn:aws:lambda:us-east-1:123456789012:function:my-fn',
  lambdaFunctionName: 'my-fn',
  lambdaRoleName: 'my-fn-role',
  rateAlarmSnsTopicArn: 'arn:aws:sns:us-east-1:123456789012:rate-topic',
  volumeAlarmSnsTopicArn: 'arn:aws:sns:us-east-1:123456789012:volume-topic',
  ...overrides,
});

describe('LambdaErrorNotification construct', () => {
  describe('Feature: Dead Letter Queue Creation', () => {
    test('DLQ is created with context-based name', () => {
      const stack = makeStack();
      new LambdaErrorNotification(stack, 'SUT', baseProps());
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::SQS::Queue', {
        QueueName: '7p-prod-processor-dlq',
      });
    });

    test('DLQ uses 7-day retention by default', () => {
      const stack = makeStack();
      new LambdaErrorNotification(stack, 'SUT', baseProps());
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::SQS::Queue', {
        MessageRetentionPeriod: 604800,
      });
    });

    test('DLQ visibility timeout defaults to 2 seconds', () => {
      const stack = makeStack();
      new LambdaErrorNotification(stack, 'SUT', baseProps());
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::SQS::Queue', {
        VisibilityTimeout: 2,
      });
    });
  });

  describe('Feature: CloudWatch Alarms', () => {
    test('Both rate and volume alarms are created', () => {
      const stack = makeStack();
      new LambdaErrorNotification(stack, 'SUT', baseProps());
      const template = Template.fromStack(stack);
      template.resourceCountIs('AWS::CloudWatch::Alarm', 2);
    });

    test('Rate alarm name derived from context', () => {
      const stack = makeStack();
      new LambdaErrorNotification(stack, 'SUT', baseProps());
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::CloudWatch::Alarm', {
        AlarmName: '7p-prod-processor-dlq-rate',
      });
    });

    test('Volume alarm name derived from context', () => {
      const stack = makeStack();
      new LambdaErrorNotification(stack, 'SUT', baseProps());
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::CloudWatch::Alarm', {
        AlarmName: '7p-prod-processor-dlq-volume',
      });
    });

    test('Alarms use default 1 datapoint over 5 periods', () => {
      const stack = makeStack();
      new LambdaErrorNotification(stack, 'SUT', baseProps());
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::CloudWatch::Alarm', {
        AlarmName: '7p-prod-processor-dlq-rate',
        DatapointsToAlarm: 1,
        EvaluationPeriods: 5,
      });
    });
  });

  describe('Feature: EventBridge Pipe', () => {
    test('EventBridge Pipe is created to reprocess DLQ messages', () => {
      const stack = makeStack();
      new LambdaErrorNotification(stack, 'SUT', baseProps());
      const template = Template.fromStack(stack);
      template.resourceCountIs('AWS::Pipes::Pipe', 1);
    });

    test('Pipe name derived from context', () => {
      const stack = makeStack();
      new LambdaErrorNotification(stack, 'SUT', baseProps());
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::Pipes::Pipe', {
        Name: '7p-prod-processor-pipe',
      });
    });

    test('Pipe target is the Lambda ARN', () => {
      const stack = makeStack();
      new LambdaErrorNotification(stack, 'SUT', baseProps());
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::Pipes::Pipe', {
        Target: 'arn:aws:lambda:us-east-1:123456789012:function:my-fn',
      });
    });
  });

  describe('Feature: Tagging', () => {
    test('Context tags applied to resources', () => {
      const stack = makeStack();
      new LambdaErrorNotification(stack, 'SUT', baseProps({
        context: makeContext({ namespace: '7p', stage: 'prod', name: 'processor', tags: { Env: 'production' } }),
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
      new LambdaErrorNotification(stack, 'SUT', baseProps({
        context: makeContext({ namespace: '7p', stage: 'test', name: 'test', enabled: false }),
      }));
      const template = Template.fromStack(stack);
      template.resourceCountIs('AWS::SQS::Queue', 0);
      template.resourceCountIs('AWS::CloudWatch::Alarm', 0);
      template.resourceCountIs('AWS::Pipes::Pipe', 0);
    });
  });
});
