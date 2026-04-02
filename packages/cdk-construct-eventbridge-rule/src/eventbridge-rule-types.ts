import { Context } from '@sevenpico/cdk-context';

export interface EventbridgeRuleProps {
  readonly context: Context;

  /** Rule description */
  readonly description?: string;

  /**
   * Event pattern as a plain object (will be JSON-serialized).
   * Required — defines what events this rule matches.
   */
  readonly eventPattern: object;

  /** Whether the rule is enabled. Default: true */
  readonly ruleEnabled?: boolean;

  /** ARN of the rule target resource. Required. */
  readonly targetArn: string;

  /** Unique target ID. Default: derived from context.id */
  readonly targetId?: string;

  /** IAM role ARN for invoking the target */
  readonly targetRoleArn?: string;

  /** Source event bus name or ARN. Default: default event bus */
  readonly sourceEventBusName?: string;

  /** Target event bus ARN (for cross-bus routing) */
  readonly targetEventBusArn?: string;
}
