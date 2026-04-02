import { Construct } from 'constructs';
import { Tags } from 'aws-cdk-lib';
import { Context, contextTags, isEnabled } from '@sevenpico/cdk-context';
import { sfnErrorNotificationProps, SfnErrorNotificationOptions } from './sfn-error-notification-fns';

export interface SfnErrorNotificationProps extends SfnErrorNotificationOptions {
  readonly context: Context;
}

export class SfnErrorNotification extends Construct {
  constructor(scope: Construct, id: string, props: SfnErrorNotificationProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    // TODO: create AWS resources using sfnErrorNotificationProps(props.context, props)
    Object.entries(contextTags(props.context))
      .forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}
