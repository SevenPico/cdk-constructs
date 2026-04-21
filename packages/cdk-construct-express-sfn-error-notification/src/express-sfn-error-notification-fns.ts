import { Context, contextId, extendContext } from '@sevenpico/cdk-context';
import { aws_cloudwatch as cw, aws_sqs as sqs, Duration } from 'aws-cdk-lib';
import { ExpressSfnErrorNotificationProps, ExpressSfnTarget } from './express-sfn-error-notification-types';

export const machineDlqContext = (ctx: Context, machineKey: string): Context =>
  extendContext(ctx, { attributes: [machineKey, 'dlq'] });

export const machinePipeName = (ctx: Context, machineKey: string): string =>
  `${contextId(extendContext(ctx, { attributes: [machineKey] }))}-pipe`;

export const machineRateAlarmName = (ctx: Context, key: string, target: ExpressSfnTarget): string =>
  target.rateAlarmName ?? `${contextId(extendContext(ctx, { attributes: [key] }))}-dlq-rate`;

export const machineVolumeAlarmName = (ctx: Context, key: string, target: ExpressSfnTarget): string =>
  target.volumeAlarmName ?? `${contextId(extendContext(ctx, { attributes: [key] }))}-dlq-volume`;

export const expressRateAlarmProps = (
  ctx: Context,
  props: ExpressSfnErrorNotificationProps,
  key: string,
  target: ExpressSfnTarget,
  queue: sqs.IQueue,
): cw.AlarmProps => ({
  alarmName: machineRateAlarmName(ctx, key, target),
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

export const expressVolumeAlarmProps = (
  ctx: Context,
  props: ExpressSfnErrorNotificationProps,
  key: string,
  target: ExpressSfnTarget,
  queue: sqs.IQueue,
): cw.AlarmProps => ({
  alarmName: machineVolumeAlarmName(ctx, key, target),
  metric: queue.metricApproximateNumberOfMessagesVisible({
    period: Duration.seconds(props.alarmPeriodSeconds ?? 60),
  }),
  threshold: 0,
  comparisonOperator: cw.ComparisonOperator.GREATER_THAN_THRESHOLD,
  datapointsToAlarm: props.alarmDatapointsToAlarm ?? 1,
  evaluationPeriods: props.alarmEvaluationPeriods ?? 5,
  treatMissingData: cw.TreatMissingData.NOT_BREACHING,
});
