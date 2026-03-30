import { Construct } from 'constructs';
import { Tags } from 'aws-cdk-lib';
import { Context, contextTags, isEnabled } from '@sevenpico/cdk-context';
import { s3WebsiteProps, S3WebsiteOptions } from './s3-website-fns';

export interface S3WebsiteProps extends S3WebsiteOptions {
  readonly context: Context;
}

export class S3Website extends Construct {
  constructor(scope: Construct, id: string, props: S3WebsiteProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    // TODO: create AWS resources using s3WebsiteProps(props.context, props)
    Object.entries(contextTags(props.context))
      .forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}
