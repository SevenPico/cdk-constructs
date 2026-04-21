import { Context, contextId, extendContext } from '@sevenpico/cdk-context';
import { aws_cloudwatch as cw, aws_sqs as sqs, Duration } from 'aws-cdk-lib';
import { LambdaErrorNotificationProps } from './lambda-error-notification-types';

export const dlqContext = (ctx: Context): Context =>
  extendContext(ctx, { attributes: ['dlq'] });

export const rateAlarmName = (ctx: Context, props: LambdaErrorNotificationProps): string =>
  props.rateAlarmName ?? `${contextId(ctx)}-dlq-rate`;

export const volumeAlarmName = (ctx: Context, props: LambdaErrorNotificationProps): string =>
  props.volumeAlarmName ?? `${contextId(ctx)}-dlq-volume`;

export const pipeName = (ctx: Context, props: LambdaErrorNotificationProps): string =>
  props.eventbridgePipeName ?? `${contextId(ctx)}-pipe`;

export const dlqProps = (ctx: Context, props: LambdaErrorNotificationProps): sqs.QueueProps => {
  const dCtx = dlqContext(ctx);
  return {
    queueName: props.sqsQueueName ?? contextId(dCtx),
    retentionPeriod: Duration.seconds(props.sqsMessageRetentionSeconds ?? 604800),
    visibilityTimeout: Duration.seconds(props.sqsVisibilityTimeoutSeconds ?? 2),
  };
};

export const rateAlarmProps = (
  ctx: Context,
  props: LambdaErrorNotificationProps,
  queue: sqs.IQueue,
): cw.AlarmProps => ({
  alarmName: rateAlarmName(ctx, props),
  alarmDescription: `DLQ message rate for Lambda ${props.lambdaFunctionName}`,
  metric: new cw.MathExpression({
    expression: 'RATE(m1)',
    usingMetrics: { m1: queue.metricApproximateNumberOfMessagesVisible() },
    period: Duration.seconds(props.alarmPeriodSeconds ?? 60),
  }),
  threshold: 0,
  comparisonOperator: cw.ComparisonOperator.GREATER_THAN_THRESHOLD,
  datapointsToAlarm: props.alarmDatapointsToAlarm ?? 1,
  evaluationPeriods: props.alarmEvaluationPeriods ?? 5,
  treatMissingData: cw.TreatMissingData.NOT_BREACHING,
});

export const volumeAlarmProps = (
  ctx: Context,
  props: LambdaErrorNotificationProps,
  queue: sqs.IQueue,
): cw.AlarmProps => ({
  alarmName: volumeAlarmName(ctx, props),
  alarmDescription: `DLQ message count for Lambda ${props.lambdaFunctionName}`,
  metric: queue.metricApproximateNumberOfMessagesVisible({
    period: Duration.seconds(props.alarmPeriodSeconds ?? 60),
  }),
  threshold: 0,
  comparisonOperator: cw.ComparisonOperator.GREATER_THAN_THRESHOLD,
  datapointsToAlarm: props.alarmDatapointsToAlarm ?? 1,
  evaluationPeriods: props.alarmEvaluationPeriods ?? 5,
  treatMissingData: cw.TreatMissingData.NOT_BREACHING,
});
