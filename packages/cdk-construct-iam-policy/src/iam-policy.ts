import { Construct } from 'constructs';
import { Tags, aws_iam as iam } from 'aws-cdk-lib';
import { contextTags, isEnabled } from '@sevenpico/cdk-context';
import { IamPolicyProps } from './iam-policy-types';
import { buildPolicyDocument, managedPolicyProps } from './iam-policy-fns';

export class IamPolicy extends Construct {
  public readonly json: string;
  public readonly policy?: iam.ManagedPolicy;

  constructor(scope: Construct, id: string, props: IamPolicyProps) {
    super(scope, id);

    const doc = buildPolicyDocument(props);
    this.json = JSON.stringify(doc.toJSON());

    if (!isEnabled(props.context)) return;
    if (!props.iamPolicyEnabled) return;

    this.policy = new iam.ManagedPolicy(this, 'Policy', managedPolicyProps(props.context, props, doc));

    Object.entries(contextTags(props.context)).forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}
