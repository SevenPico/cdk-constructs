import { Context } from '@sevenpico/cdk-context';

export interface SfnErrorNotificationProps {
  readonly context: Context;

  /** ARN of the Step Functions state machine to monitor. Required. */
  readonly stateMachineArn: string;

  /** ARN of the SNS topic for the rate alarm. Required. */
  readonly rateAlarmSnsTopicArn: string;

  /** ARN of the SNS topic for the volume alarm. Required. */
  readonly volumeAlarmSnsTopicArn: string;

  /** KMS key ARN for SQS encryption */
  readonly sqsKmsKeyArn?: string;

  /** SQS queue name override. Default: derived from context.id */
  readonly sqsQueueName?: string;

  /** SQS message retention in seconds. Default: 604800 (7 days) */
  readonly sqsMessageRetentionSeconds?: number;

  /** SQS visibility timeout in seconds. Default: 2 */
  readonly sqsVisibilityTimeoutSeconds?: number;

  /** EventBridge rule name override. Default: derived from context.id */
  readonly eventbridgeRuleName?: string;

  /** Alarm evaluation period in seconds. Default: 60 */
  readonly alarmPeriodSeconds?: number;

  /** Data points to trigger alarm. Default: 2 */
  readonly alarmDatapointsToAlarm?: number;

  /** Number of evaluation periods. Default: 2 */
  readonly alarmEvaluationPeriods?: number;

  /** EventBridge Pipe name override. Default: derived from context.id */
  readonly eventbridgePipeName?: string;

  /** Batch size for the EventBridge Pipe. Default: 1 */
  readonly eventbridgePipeBatchSize?: number;

  /** Pipe log level. Default: 'ERROR' */
  readonly eventbridgePipeLogLevel?: string;

  /** CloudWatch log retention for pipe in days. Default: 90 */
  readonly cloudwatchLogRetentionDays?: number;

  /** Input template for the pipe target (Step Functions input). Default: '<$.detail.input>' */
  readonly targetStepFunctionInputTemplate?: string;

  /** KMS key ID for SNS topic (alarm actions) */
  readonly snsKmsKeyId?: string;

  /** Custom rate alarm name */
  readonly rateAlarmName?: string;

  /** Custom volume alarm name */
  readonly volumeAlarmName?: string;
}
