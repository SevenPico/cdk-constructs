import { Construct } from 'constructs';
import { Tags } from 'aws-cdk-lib';
import { Context, contextTags, isEnabled } from '@sevenpico/cdk-context';
import { eventbridgeRuleProps, EventbridgeRuleOptions } from './eventbridge-rule-fns';

export interface EventbridgeRuleProps extends EventbridgeRuleOptions {
  readonly context: Context;
}

export class EventbridgeRule extends Construct {
  constructor(scope: Construct, id: string, props: EventbridgeRuleProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    // TODO: create AWS resources using eventbridgeRuleProps(props.context, props)
    Object.entries(contextTags(props.context))
      .forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}
