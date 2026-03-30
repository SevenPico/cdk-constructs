import { Construct } from 'constructs';
import { Tags } from 'aws-cdk-lib';
import { Context, contextTags, isEnabled } from '@sevenpico/cdk-context';
import { s3LogStorageProps, S3LogStorageOptions } from './s3-log-storage-fns';

export interface S3LogStorageProps extends S3LogStorageOptions {
  readonly context: Context;
}

export class S3LogStorage extends Construct {
  constructor(scope: Construct, id: string, props: S3LogStorageProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    // TODO: create AWS resources using s3LogStorageProps(props.context, props)
    Object.entries(contextTags(props.context))
      .forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}
