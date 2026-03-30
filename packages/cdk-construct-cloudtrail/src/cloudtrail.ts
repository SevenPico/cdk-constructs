import { Construct } from 'constructs';
import { Tags } from 'aws-cdk-lib';
import { Context, contextTags, isEnabled } from '@sevenpico/cdk-context';
import { cloudtrailProps, CloudtrailOptions } from './cloudtrail-fns';

export interface CloudtrailProps extends CloudtrailOptions {
  readonly context: Context;
}

export class Cloudtrail extends Construct {
  constructor(scope: Construct, id: string, props: CloudtrailProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    // TODO: create AWS resources using cloudtrailProps(props.context, props)
    Object.entries(contextTags(props.context))
      .forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}
