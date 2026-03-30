import { Construct } from 'constructs';
import { Tags } from 'aws-cdk-lib';
import { Context, contextTags, isEnabled } from '@sevenpico/cdk-context';
import { kmsKeyProps, KmsKeyOptions } from './kms-key-fns';

export interface KmsKeyProps extends KmsKeyOptions {
  readonly context: Context;
}

export class KmsKey extends Construct {
  constructor(scope: Construct, id: string, props: KmsKeyProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    // TODO: create AWS resources using kmsKeyProps(props.context, props)
    Object.entries(contextTags(props.context))
      .forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}
