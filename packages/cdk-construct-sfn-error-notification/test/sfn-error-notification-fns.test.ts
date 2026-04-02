import { makeContext } from '@sevenpico/cdk-context';
import {
  dlqContext,
  rateAlarmName,
  volumeAlarmName,
  pipeName,
  eventbridgeRuleName,
  failedExecutionPattern,
  dlqProps,
} from '../src/sfn-error-notification-fns';
import { SfnErrorNotificationProps } from '../src/sfn-error-notification-types';

const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'workflow' });

const baseProps: SfnErrorNotificationProps = {
  context: ctx,
  stateMachineArn: 'arn:aws:states:us-east-1:123456789012:stateMachine:my-sfn',
  rateAlarmSnsTopicArn: 'arn:aws:sns:us-east-1:123456789012:rate-topic',
  volumeAlarmSnsTopicArn: 'arn:aws:sns:us-east-1:123456789012:volume-topic',
};

describe('SfnErrorNotification pure functions', () => {
  test('dlqContext appends dlq attribute', () => {
    const dCtx = dlqContext(ctx);
    expect(dCtx.attributes).toContain('dlq');
  });

  test('rateAlarmName derives from context', () => {
    expect(rateAlarmName(ctx, baseProps)).toBe('7p-prod-workflow-dlq-rate');
  });

  test('volumeAlarmName derives from context', () => {
    expect(volumeAlarmName(ctx, baseProps)).toBe('7p-prod-workflow-dlq-volume');
  });

  test('pipeName derives from context', () => {
    expect(pipeName(ctx, baseProps)).toBe('7p-prod-workflow-pipe');
  });

  test('eventbridgeRuleName derives from context', () => {
    expect(eventbridgeRuleName(ctx, baseProps)).toBe('7p-prod-workflow-failed');
  });

  test('failedExecutionPattern matches FAILED, TIMED_OUT, ABORTED', () => {
    const pattern = failedExecutionPattern('arn:aws:states:us-east-1:123:stateMachine:test');
    expect(pattern.detail?.status).toEqual(['FAILED', 'TIMED_OUT', 'ABORTED']);
    expect(pattern.source).toEqual(['aws.states']);
  });

  test('dlqProps uses context-based queue name', () => {
    const props = dlqProps(ctx, baseProps);
    expect(props.queueName).toBe('7p-prod-workflow-dlq');
  });

  test('dlqProps uses 7-day retention by default', () => {
    const props = dlqProps(ctx, baseProps);
    expect(props.retentionPeriod?.toSeconds()).toBe(604800);
  });

  test('dlqProps uses 2-second visibility timeout by default', () => {
    const props = dlqProps(ctx, baseProps);
    expect(props.visibilityTimeout?.toSeconds()).toBe(2);
  });
});
