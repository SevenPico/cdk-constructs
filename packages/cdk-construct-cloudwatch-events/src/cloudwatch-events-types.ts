import { Context } from '@sevenpico/cdk-context';

export interface CloudwatchEventInputTransformer {
  /** Map of JSON path expressions to named variables used in the input template. */
  readonly inputPathsMap: Record<string, string>;
  /** Template string referencing the named variables from inputPathsMap. */
  readonly inputTemplate: string;
}

export interface CloudwatchEventTarget {
  /**
   * Target resource type.
   * 'sns' | 'lambda' | 'sqs'
   */
  readonly type: string;
  /** ARN of the target resource. */
  readonly arn: string;
  /** Optional input transformer to reshape the event payload before delivery. */
  readonly inputTransformer?: CloudwatchEventInputTransformer;
}

export interface CloudwatchEventRule {
  /**
   * Logical rule name appended to the context ID for the CloudFormation resource name.
   * Example: if context id is '7p-prod-monitor' and name is 'ec2-state', the rule
   * will be named '7p-prod-monitor-ec2-state'.
   */
  readonly name: string;
  /** Human-readable description for the event rule. */
  readonly description?: string;
  /**
   * Cron or rate schedule expression.
   * Example: 'rate(5 minutes)' or 'cron(0 12 * * ? *)'.
   * Mutually exclusive with eventPattern.
   */
  readonly schedule?: string;
  /**
   * EventBridge event pattern as a JSON string.
   * Example: '{"source":["aws.ec2"],"detail-type":["EC2 Instance State-change Notification"]}'
   * Mutually exclusive with schedule.
   */
  readonly eventPattern?: string;
  /** One or more targets to route matched events to. */
  readonly targets: CloudwatchEventTarget[];
}

export interface CloudwatchEventsProps {
  readonly context: Context;

  /** One or more event rules to create. Required. */
  readonly rules: CloudwatchEventRule[];
}
