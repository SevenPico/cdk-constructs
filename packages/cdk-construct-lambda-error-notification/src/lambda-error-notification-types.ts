import { Context } from '@sevenpico/cdk-context';

export interface SqsKmsConfig {
  readonly keyId: string;
  readonly keyArn: string;
}

export interface LambdaErrorNotificationProps {
  readonly context: Context;

  /** ARN of the Lambda function to monitor. Required. */
  readonly lambdaArn: string;

  /** Name of the Lambda function (used for async event config). Required. */
  readonly lambdaFunctionName: string;

  /** Name of the Lambda execution role (used for DLQ policy attachment). Required. */
  readonly lambdaRoleName: string;

  /** ARN of the SNS topic for the rate alarm notification. Required. */
  readonly rateAlarmSnsTopicArn: string;

  /** ARN of the SNS topic for the volume alarm notification. Required. */
  readonly volumeAlarmSnsTopicArn: string;

  /** CloudWatch alarm evaluation period in seconds. Default: 60 */
  readonly alarmPeriodSeconds?: number;

  /** Data points required to trigger alarm. Default: 1 */
  readonly alarmDatapointsToAlarm?: number;

  /** Number of evaluation periods. Default: 5 */
  readonly alarmEvaluationPeriods?: number;

  /** Custom rate alarm name. Default: derived from context.id */
  readonly rateAlarmName?: string;

  /** Custom volume alarm name. Default: derived from context.id */
  readonly volumeAlarmName?: string;

  /** SQS queue name override. Default: derived from context.id */
  readonly sqsQueueName?: string;

  /** SQS message retention in seconds. Default: 604800 (7 days) */
  readonly sqsMessageRetentionSeconds?: number;

  /** SQS visibility timeout in seconds. Default: 2 */
  readonly sqsVisibilityTimeoutSeconds?: number;

  /** KMS encryption config for the SQS DLQ */
  readonly sqsKmsConfig?: SqsKmsConfig;

  /** KMS key ID for SNS topic encryption (for alarm actions) */
  /** EventBridge Pipe name override. Default: derived from context.id */
  readonly eventbridgePipeName?: string;

  /** Batch size for the EventBridge Pipe. Default: 1 */
  readonly eventbridgePipeBatchSize?: number;

  /** Log level for the EventBridge Pipe. Default: 'ERROR' */
  readonly eventbridgePipeLogLevel?: string;

  /** CloudWatch log retention for the pipe in days. Default: 90 */
  readonly cloudwatchLogRetentionDays?: number;

  /** Input template for the EventBridge Pipe target. Default: '<$.requestPayload>' */
  readonly targetLambdaInputTemplate?: string;

  /** Lambda async config: max event age in seconds. Default: 3600 */
  /** Lambda async config: max retry attempts. Default: 2 */
}
