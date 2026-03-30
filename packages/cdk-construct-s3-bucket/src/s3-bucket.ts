import { Construct } from 'constructs';
import { Tags } from 'aws-cdk-lib';
import { Context, contextTags, isEnabled } from '@sevenpico/cdk-context';
import { s3BucketProps, S3BucketOptions } from './s3-bucket-fns';

export interface S3BucketProps extends S3BucketOptions {
  readonly context: Context;
}

export class S3Bucket extends Construct {
  constructor(scope: Construct, id: string, props: S3BucketProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    // TODO: create AWS resources using s3BucketProps(props.context, props)
    Object.entries(contextTags(props.context))
      .forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}
