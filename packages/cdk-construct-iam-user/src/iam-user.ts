import { Construct } from 'constructs';
import { Tags } from 'aws-cdk-lib';
import { Context, contextTags, isEnabled } from '@sevenpico/cdk-context';
import { iamUserProps, IamUserOptions } from './iam-user-fns';

export interface IamUserProps extends IamUserOptions {
  readonly context: Context;
}

export class IamUser extends Construct {
  constructor(scope: Construct, id: string, props: IamUserProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    // TODO: create AWS resources using iamUserProps(props.context, props)
    Object.entries(contextTags(props.context))
      .forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}
