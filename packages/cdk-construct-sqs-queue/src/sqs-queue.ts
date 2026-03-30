import { Construct } from 'constructs';
import { Tags } from 'aws-cdk-lib';
import { Context, contextTags, isEnabled } from '@sevenpico/cdk-context';
import { sqsQueueProps, SqsQueueOptions } from './sqs-queue-fns';

export interface SqsQueueProps extends SqsQueueOptions {
  readonly context: Context;
}

export class SqsQueue extends Construct {
  constructor(scope: Construct, id: string, props: SqsQueueProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    // TODO: create AWS resources using sqsQueueProps(props.context, props)
    Object.entries(contextTags(props.context))
      .forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}
