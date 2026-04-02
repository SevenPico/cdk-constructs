import { Context } from '@sevenpico/cdk-context';

export interface ExpressSfnTarget {
  /** ARN of the EXPRESS state machine */
  readonly arn: string;
  /** CloudWatch log group name for the state machine */
  readonly logGroupName?: string;
  /** SQS queue name override for this machine's DLQ */
  readonly sqsQueueName?: string;
  /** Rate alarm name override */
  readonly rateAlarmName?: string;
  /** Volume alarm name override */
  readonly volumeAlarmName?: string;
}

export interface SqsKmsConfig {
  readonly keyId: string;
  readonly keyArn: string;
}

export interface ExpressSfnErrorNotificationProps {
  readonly context: Context;

  /**
   * Map of logical name to state machine configuration.
   * Each entry creates a full set of monitoring resources for that state machine.
   * Required — must have at least one entry.
   */
  readonly stepFunctions: Record<string, ExpressSfnTarget>;

  /** ARN of the SNS topic for all rate alarms. Required. */
  readonly rateAlarmSnsTopicArn: string;

  /** ARN of the SNS topic for all volume alarms. Required. */
  readonly volumeAlarmSnsTopicArn: string;

  /** SQS message retention in seconds. Default: 604800 (7 days) */
  readonly sqsMessageRetentionSeconds?: number;

  /** SQS visibility timeout in seconds. Default: 30 (higher than standard SFN) */
  readonly sqsVisibilityTimeoutSeconds?: number;

  /** Alarm evaluation period in seconds. Default: 60 */
  readonly alarmPeriodSeconds?: number;

  /** Data points to alarm. Default: 1 */
  readonly alarmDatapointsToAlarm?: number;

  /** Evaluation periods. Default: 5 */
  readonly alarmEvaluationPeriods?: number;

  /** Batch size for all pipes. Default: 1 */
  readonly eventbridgePipeBatchSize?: number;

  /** Log level for all pipes. Default: 'ERROR' */
  readonly eventbridgePipeLogLevel?: string;

  /** CloudWatch log retention for pipes in days. Default: 90 */
  readonly cloudwatchLogRetentionDays?: number;

  /** Input template for all pipe targets. Default: '<$.detail.input>' */
  readonly targetStepFunctionInputTemplate?: string;

  /** KMS encryption config for all DLQs */
  readonly sqsKmsConfig?: SqsKmsConfig;
}
