import { makeContext } from '@sevenpico/cdk-context';
import {
  dlqContext,
  rateAlarmName,
  volumeAlarmName,
  pipeName,
  dlqProps,
} from '../src/lambda-error-notification-fns';
import { LambdaErrorNotificationProps } from '../src/lambda-error-notification-types';

const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'processor' });

const baseProps: LambdaErrorNotificationProps = {
  context: ctx,
  lambdaArn: 'arn:aws:lambda:us-east-1:123456789012:function:my-fn',
  lambdaFunctionName: 'my-fn',
  lambdaRoleName: 'my-fn-role',
  rateAlarmSnsTopicArn: 'arn:aws:sns:us-east-1:123456789012:rate-topic',
  volumeAlarmSnsTopicArn: 'arn:aws:sns:us-east-1:123456789012:volume-topic',
};

describe('LambdaErrorNotification pure functions', () => {
  test('dlqContext appends dlq attribute', () => {
    const dCtx = dlqContext(ctx);
    expect(dCtx.attributes).toContain('dlq');
  });

  test('rateAlarmName derives from context', () => {
    expect(rateAlarmName(ctx, baseProps)).toBe('7p-prod-processor-dlq-rate');
  });

  test('rateAlarmName uses override when provided', () => {
    expect(rateAlarmName(ctx, { ...baseProps, rateAlarmName: 'custom-rate' })).toBe('custom-rate');
  });

  test('volumeAlarmName derives from context', () => {
    expect(volumeAlarmName(ctx, baseProps)).toBe('7p-prod-processor-dlq-volume');
  });

  test('pipeName derives from context', () => {
    expect(pipeName(ctx, baseProps)).toBe('7p-prod-processor-pipe');
  });

  test('pipeName uses override when provided', () => {
    expect(pipeName(ctx, { ...baseProps, eventbridgePipeName: 'custom-pipe' })).toBe('custom-pipe');
  });

  test('dlqProps uses context-based queue name', () => {
    const props = dlqProps(ctx, baseProps);
    expect(props.queueName).toBe('7p-prod-processor-dlq');
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
