import { Construct } from 'constructs';
import { Tags } from 'aws-cdk-lib';
import { Context, contextTags, isEnabled } from '@sevenpico/cdk-context';
import { kinesisStreamProps, KinesisStreamOptions } from './kinesis-stream-fns';

export interface KinesisStreamProps extends KinesisStreamOptions {
  readonly context: Context;
}

export class KinesisStream extends Construct {
  constructor(scope: Construct, id: string, props: KinesisStreamProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    // TODO: create AWS resources using kinesisStreamProps(props.context, props)
    Object.entries(contextTags(props.context))
      .forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}
