import { Context } from '@sevenpico/cdk-context';

export interface CloudwatchFlowLogsProps {
  readonly context: Context;

  /** ID of the VPC to capture flow logs for. Required. */
  readonly vpcId: string;

  /**
   * Which traffic to capture.
   * 'ALL' | 'ACCEPT' | 'REJECT'. Default: 'ALL'
   */
  readonly trafficType?: string;

  /** CloudWatch Logs log group retention in days. Default: 365 */
  readonly cloudwatchLogRetentionDays?: number;

  /** ARN of a KMS key used to encrypt the CloudWatch Logs log group. */
  readonly logGroupKmsKeyArn?: string;
}
