import { Construct } from 'constructs';
import { Tags } from 'aws-cdk-lib';
import { Context, contextTags, isEnabled } from '@sevenpico/cdk-context';
import { iamRoleProps, IamRoleOptions } from './iam-role-fns';

export interface IamRoleProps extends IamRoleOptions {
  readonly context: Context;
}

export class IamRole extends Construct {
  constructor(scope: Construct, id: string, props: IamRoleProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    // TODO: create AWS resources using iamRoleProps(props.context, props)
    Object.entries(contextTags(props.context))
      .forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}
