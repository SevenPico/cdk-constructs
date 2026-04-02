import { Construct } from 'constructs';
import {
  Tags,
  aws_events as events,
  aws_events_targets as targets,
} from 'aws-cdk-lib';
import { contextTags, isEnabled } from '@sevenpico/cdk-context';
import { EventbridgeRuleProps } from './eventbridge-rule-types';
import { eventbridgeRuleProps, targetId } from './eventbridge-rule-fns';

export class EventbridgeRule extends Construct {
  public readonly rule?: events.Rule;

  constructor(scope: Construct, id: string, props: EventbridgeRuleProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    // Source event bus (optional — defaults to default bus)
    const eventBus = props.sourceEventBusName
      ? events.EventBus.fromEventBusName(this, 'SourceBus', props.sourceEventBusName)
      : undefined;

    this.rule = new events.Rule(this, 'Rule',
      eventbridgeRuleProps(props.context, props, eventBus),
    );

    if (props.targetEventBusArn) {
      // Cross-bus target
      const targetBus = events.EventBus.fromEventBusArn(this, 'TargetBus', props.targetEventBusArn);
      this.rule.addTarget(new targets.EventBus(targetBus));
    } else {
      // Generic ARN target via CfnRule escape hatch
      const cfnRule = this.rule.node.defaultChild as events.CfnRule;
      cfnRule.targets = [{
        arn: props.targetArn,
        id: targetId(props.context, props),
        roleArn: props.targetRoleArn,
      }];
    }

    Object.entries(contextTags(props.context)).forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}
