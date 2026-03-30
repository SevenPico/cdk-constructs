import { Construct } from 'constructs';
import { Tags } from 'aws-cdk-lib';
import { Context, contextTags, isEnabled } from '@sevenpico/cdk-context';
import { expressSfnErrorNotificationProps, ExpressSfnErrorNotificationOptions } from './express-sfn-error-notification-fns';

export interface ExpressSfnErrorNotificationProps extends ExpressSfnErrorNotificationOptions {
  readonly context: Context;
}

export class ExpressSfnErrorNotification extends Construct {
  constructor(scope: Construct, id: string, props: ExpressSfnErrorNotificationProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    // TODO: create AWS resources using expressSfnErrorNotificationProps(props.context, props)
    Object.entries(contextTags(props.context))
      .forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}
