import { Construct } from 'constructs';
import { Tags } from 'aws-cdk-lib';
import { Context, contextTags, isEnabled } from '@sevenpico/cdk-context';
import { slackbotProps, SlackbotOptions } from './slackbot-fns';

export interface SlackbotProps extends SlackbotOptions {
  readonly context: Context;
}

export class Slackbot extends Construct {
  constructor(scope: Construct, id: string, props: SlackbotProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    // TODO: create AWS resources using slackbotProps(props.context, props)
    Object.entries(contextTags(props.context))
      .forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}
