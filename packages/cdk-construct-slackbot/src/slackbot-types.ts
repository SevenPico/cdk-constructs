import { Context } from '@sevenpico/cdk-context';

export interface SlackbotProps {
  readonly context: Context;

  /**
   * Map of SNS topic attribute name to Slack channel ID.
   * Example: { 'alerts': 'C01234ABCDE', 'deployments': 'C09876ZYXWV' }
   * Required.
   */
  readonly slackChannels: Record<string, string>;

  /**
   * ARN of the AWS Secrets Manager secret containing the Slack bot token.
   * Required.
   */
  readonly slackTokenSecretArn: string;

  /**
   * KMS key ARN for decrypting the Slack token secret.
   * Required if the secret is KMS-encrypted.
   */
  readonly slackTokenSecretKmsKeyArn?: string;

  /**
   * Path to local Lambda deployment package directory or ZIP file.
   * The Lambda handler is expected at main.lambda_handler.
   * Default: './lambda' (relative to the CDK app entry point)
   */
  readonly lambdaCodePath?: string;

  /** Lambda runtime. Default: 'python3.9' */
  readonly lambdaRuntime?: string;

  /** CloudWatch log retention in days. Default: 90 */
  readonly cloudwatchLogExpirationDays?: number;

  /**
   * IAM principals allowed to publish to the SNS topic.
   * Key: principal type ('Service' | 'AWS'). Value: list of identifiers.
   */
  readonly snsPubPrincipals?: Record<string, string[]>;

  /**
   * IAM principals allowed to subscribe to the SNS topic.
   * Key: principal type. Value: list of identifiers.
   */
  readonly snsSubPrincipals?: Record<string, string[]>;
}
