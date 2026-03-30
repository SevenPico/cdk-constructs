import { Construct } from 'constructs';
import { Tags } from 'aws-cdk-lib';
import { Context, contextTags, isEnabled } from '@sevenpico/cdk-context';
import { eventbridgeProps, EventbridgeOptions } from './eventbridge-fns';

export interface EventbridgeProps extends EventbridgeOptions {
  readonly context: Context;
}

export class Eventbridge extends Construct {
  constructor(scope: Construct, id: string, props: EventbridgeProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    // TODO: create AWS resources using eventbridgeProps(props.context, props)
    Object.entries(contextTags(props.context))
      .forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}
