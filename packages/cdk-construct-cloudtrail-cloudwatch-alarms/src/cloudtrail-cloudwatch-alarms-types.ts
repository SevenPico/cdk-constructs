import { Context } from '@sevenpico/cdk-context';

export interface CloudtrailCloudwatchAlarmsProps {
  readonly context: Context;

  /** Name of the CloudTrail CloudWatch Logs log group to watch. Required. */
  readonly logGroupName: string;

  /** ARN of the SNS topic that receives alarm notifications. Required. */
  readonly snsTopicArn: string;

  /**
   * CloudWatch metric namespace for all generated metrics.
   * Default: 'CISBenchmark'
   */
  readonly alarmNamespace?: string;

  /** Evaluation period in seconds for each alarm. Default: 300 */
  readonly alarmPeriodSeconds?: number;

  /** Number of evaluation periods before alarm triggers. Default: 1 */
  readonly alarmEvaluationPeriods?: number;

  /** Metric threshold that triggers the alarm. Default: 1 */
  readonly alarmThreshold?: number;

  /**
   * Subset of alarm IDs to enable. When omitted, all alarms are created.
   * Valid values:
   *   'unauthorized-api' | 'no-mfa-console' | 'root-usage' | 'iam-policy-changes' |
   *   'cloudtrail-changes' | 'console-failures' | 'kms-key-deletion' | 's3-bucket-policy' |
   *   'vpc-changes' | 'security-group-changes' | 'nacl-changes' |
   *   'network-gateway-changes' | 'route-table-changes' | 'organization-changes'
   */
  readonly enabledAlarms?: string[];
}
