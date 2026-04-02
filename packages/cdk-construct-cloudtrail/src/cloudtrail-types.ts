import { Context } from '@sevenpico/cdk-context';

export interface CloudtrailDataEventSelector {
  /** AWS resource type. Example: 'AWS::S3::Object' | 'AWS::Lambda::Function' */
  readonly resourceType: string;
  /** List of resource ARNs to include. Use 'arn:aws:s3:::' for all S3 objects. */
  readonly resourceArns: string[];
}

export interface CloudtrailProps {
  readonly context: Context;

  /** S3 bucket name where trail logs are delivered. Required. */
  readonly s3BucketName: string;

  /** S3 key prefix for log files. Default: '' */
  readonly s3KeyPrefix?: string;

  /** Include events from global services such as IAM. Default: true */
  readonly includeGlobalServiceEvents?: boolean;

  /** Record events in all regions. Default: true */
  readonly isMultiRegionTrail?: boolean;

  /** Validate log file integrity using digest files. Default: true */
  readonly enableLogFileValidation?: boolean;

  /** Send trail events to a CloudWatch Logs log group. Default: false */
  readonly cloudWatchLogsEnabled?: boolean;

  /** CloudWatch Logs retention in days when log group is created. Default: 90 */
  readonly cloudWatchLogsRetentionDays?: number;

  /** SNS topic ARN for trail delivery notifications. */
  readonly snsTopicArn?: string;

  /** KMS key ARN used to encrypt log files. */
  readonly kmsKeyArn?: string;

  /** Enable CloudTrail Insights to detect unusual API activity. Default: false */
  readonly enableInsights?: boolean;

  /**
   * Management event selector.
   * 'ReadWrite' | 'Read' | 'Write' | 'None'. Default: 'ReadWrite'
   */
  readonly managementEvents?: string;

  /** Data event selectors for S3 objects or Lambda functions. */
  readonly dataEvents?: CloudtrailDataEventSelector[];
}
