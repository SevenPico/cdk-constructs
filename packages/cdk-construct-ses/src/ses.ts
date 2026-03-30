import { Construct } from 'constructs';
import { Tags } from 'aws-cdk-lib';
import { Context, contextTags, isEnabled } from '@sevenpico/cdk-context';
import { sesProps, SesOptions } from './ses-fns';

export interface SesProps extends SesOptions {
  readonly context: Context;
}

export class Ses extends Construct {
  constructor(scope: Construct, id: string, props: SesProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    // TODO: create AWS resources using sesProps(props.context, props)
    Object.entries(contextTags(props.context))
      .forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}
