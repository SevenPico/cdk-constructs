import { Construct } from 'constructs';
import { Tags } from 'aws-cdk-lib';
import { Context, contextTags, isEnabled } from '@sevenpico/cdk-context';
import { secretProps, SecretOptions } from './secret-fns';

export interface SecretProps extends SecretOptions {
  readonly context: Context;
}

export class Secret extends Construct {
  constructor(scope: Construct, id: string, props: SecretProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    // TODO: create AWS resources using secretProps(props.context, props)
    Object.entries(contextTags(props.context))
      .forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}
