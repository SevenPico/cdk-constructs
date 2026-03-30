import { Construct } from 'constructs';
import { Tags } from 'aws-cdk-lib';
import { Context, contextTags, isEnabled } from '@sevenpico/cdk-context';
import { iamPolicyProps, IamPolicyOptions } from './iam-policy-fns';

export interface IamPolicyProps extends IamPolicyOptions {
  readonly context: Context;
}

export class IamPolicy extends Construct {
  constructor(scope: Construct, id: string, props: IamPolicyProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    // TODO: create AWS resources using iamPolicyProps(props.context, props)
    Object.entries(contextTags(props.context))
      .forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}
