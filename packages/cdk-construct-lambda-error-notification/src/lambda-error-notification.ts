import { Construct } from 'constructs';
import { Tags } from 'aws-cdk-lib';
import { Context, contextTags, isEnabled } from '@sevenpico/cdk-context';
import { lambdaErrorNotificationProps, LambdaErrorNotificationOptions } from './lambda-error-notification-fns';

export interface LambdaErrorNotificationProps extends LambdaErrorNotificationOptions {
  readonly context: Context;
}

export class LambdaErrorNotification extends Construct {
  constructor(scope: Construct, id: string, props: LambdaErrorNotificationProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    // TODO: create AWS resources using lambdaErrorNotificationProps(props.context, props)
    Object.entries(contextTags(props.context))
      .forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}
