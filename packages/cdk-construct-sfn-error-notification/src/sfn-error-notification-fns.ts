import { aws_cloudwatch as cw, aws_events as events, aws_sqs as sqs, Duration } from 'aws-cdk-lib';
import { Context, contextId, extendContext } from '@sevenpico/cdk-context';
import { SfnErrorNotificationProps } from './sfn-error-notification-types';

export const dlqContext = (ctx: Context): Context =>
  extendContext(ctx, { attributes: ['dlq'] });

export const rateAlarmName = (ctx: Context, props: SfnErrorNotificationProps): string =>
  props.rateAlarmName ?? `${contextId(ctx)}-dlq-rate`;

export const volumeAlarmName = (ctx: Context, props: SfnErrorNotificationProps): string =>
  props.volumeAlarmName ?? `${contextId(ctx)}-dlq-volume`;

export const pipeName = (ctx: Context, props: SfnErrorNotificationProps): string =>
  props.eventbridgePipeName ?? `${contextId(ctx)}-pipe`;

export const eventbridgeRuleName = (ctx: Context, props: SfnErrorNotificationProps): string =>
  props.eventbridgeRuleName ?? `${contextId(ctx)}-failed`;

export const failedExecutionPattern = (stateMachineArn: string): events.EventPattern => ({
  source: ['aws.states'],
  detailType: ['Step Functions Execution Status Change'],
  detail: {
    status: ['FAILED', 'TIMED_OUT', 'ABORTED'],
    stateMachineArn: [stateMachineArn],
  },
});

export const dlqProps = (ctx: Context, props: SfnErrorNotificationProps): sqs.QueueProps => {
  const dCtx = dlqContext(ctx);
  return {
    queueName: props.sqsQueueName ?? contextId(dCtx),
    retentionPeriod: Duration.seconds(props.sqsMessageRetentionSeconds ?? 604800),
    visibilityTimeout: Duration.seconds(props.sqsVisibilityTimeoutSeconds ?? 2),
  };
};

export const rateAlarmProps = (
  ctx: Context,
  props: SfnErrorNotificationProps,
  queue: sqs.IQueue,
): cw.AlarmProps => ({
  alarmName: rateAlarmName(ctx, props),
  metric: new cw.MathExpression({
    expression: 'RATE(m1)',
    usingMetrics: { m1: queue.metricApproximateNumberOfMessagesVisible() },
    period: Duration.seconds(props.alarmPeriodSeconds ?? 60),
  }),
  threshold: 0,
  comparisonOperator: cw.ComparisonOperator.GREATER_THAN_THRESHOLD,
  datapointsToAlarm: props.alarmDatapointsToAlarm ?? 2,
  evaluationPeriods: props.alarmEvaluationPeriods ?? 2,
  treatMissingData: cw.TreatMissingData.NOT_BREACHING,
});

export const volumeAlarmProps = (
  ctx: Context,
  props: SfnErrorNotificationProps,
  queue: sqs.IQueue,
): cw.AlarmProps => ({
  alarmName: volumeAlarmName(ctx, props),
  metric: queue.metricApproximateNumberOfMessagesVisible({
    period: Duration.seconds(props.alarmPeriodSeconds ?? 60),
  }),
  threshold: 0,
  comparisonOperator: cw.ComparisonOperator.GREATER_THAN_THRESHOLD,
  datapointsToAlarm: props.alarmDatapointsToAlarm ?? 2,
  evaluationPeriods: props.alarmEvaluationPeriods ?? 2,
  treatMissingData: cw.TreatMissingData.NOT_BREACHING,
});
