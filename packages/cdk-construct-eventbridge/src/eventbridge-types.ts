import { Context } from '@sevenpico/cdk-context';

export interface EventbridgeProps {
  readonly context: Context;

  /** Event bus name override. Default: context.id */
  readonly eventBusName?: string;

  /** KMS key identifier (ARN or alias) for event bus encryption */
  readonly kmsKeyIdentifier?: string;

  /** Partner event source name (for partner event buses) */
  readonly eventSourceName?: string;

  /** Event bus resource policy as JSON string */
  readonly policyDocument?: string;
}
