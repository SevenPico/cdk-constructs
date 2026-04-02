import { Context } from '@sevenpico/cdk-context';

export interface StepFunctionsLoggingConfig {
  /** Log all execution history. Default: false */
  readonly includeExecutionData?: boolean;
  /** Log level. 'ALL' | 'ERROR' | 'FATAL' | 'OFF'. Default: 'OFF' */
  readonly level?: string;
}

export interface StepFunctionsProps {
  readonly context: Context;

  /** Amazon States Language definition object. Required. */
  readonly definition: object;

  /** State machine type. 'STANDARD' | 'EXPRESS'. Default: 'STANDARD' */
  readonly type?: string;

  /** State machine name override. Default: context.id */
  readonly stateMachineName?: string;

  /** Enable X-Ray tracing. Default: false */
  readonly tracingEnabled?: boolean;

  /** Logging configuration */
  readonly loggingConfiguration?: StepFunctionsLoggingConfig;

  /** Use an existing CloudWatch log group ARN instead of creating one */
  readonly existingLogGroupArn?: string;

  /** Log group name override. Default: derived from context.id */
  readonly logGroupName?: string;

  /** Log group retention in days. Default: 90 */
  readonly logGroupRetentionDays?: number;

  /** KMS key ARN for log encryption */
  readonly cloudwatchLogsKmsKeyArn?: string;

  /** Role description. Required. */
  readonly roleDescription: string;

  /** Additional IAM policy document JSON strings */
  readonly policyDocuments?: string[];

  /** Managed policy ARNs to attach to execution role */
  readonly managedPolicyArns?: string[];

  /** Principals allowed to assume the execution role. Default: { Service: ['states.amazonaws.com'] } */
  readonly principals?: Record<string, string[]>;

  /** Max session duration in seconds. Default: 3600 */
  readonly maxSessionDuration?: number;

  /** Permissions boundary ARN */
  readonly permissionsBoundary?: string;

  /** IAM path. Default: '/' */
  readonly path?: string;

  /** If true, use full context ID for role name. Default: true */
  readonly useFullname?: boolean;
}
