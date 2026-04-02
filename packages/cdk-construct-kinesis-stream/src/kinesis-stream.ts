import { Construct } from 'constructs';
import {
  Tags,
  aws_kinesis as kinesis,
  aws_kms as kms,
} from 'aws-cdk-lib';
import { contextTags, isEnabled } from '@sevenpico/cdk-context';
import { KinesisStreamProps } from './kinesis-stream-types';
import {
  kinesisStreamProps,
  consumerName,
  streamEncryption,
} from './kinesis-stream-fns';

export class KinesisStream extends Construct {
  public readonly stream?: kinesis.Stream;

  constructor(scope: Construct, id: string, props: KinesisStreamProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    const encKey = (props.kmsKeyId && props.kmsKeyId !== 'alias/aws/kinesis'
      && streamEncryption(props) === kinesis.StreamEncryption.KMS)
      ? kms.Key.fromKeyArn(this, 'Key', props.kmsKeyId)
      : undefined;

    this.stream = new kinesis.Stream(this, 'Stream', {
      ...kinesisStreamProps(props.context, props),
      encryptionKey: encKey,
    });

    // Registered consumers
    for (let i = 0; i < (props.consumerCount ?? 0); i++) {
      new kinesis.CfnStreamConsumer(this, `Consumer${i}`, {
        streamArn: this.stream.streamArn,
        consumerName: consumerName(props.context, i),
      });
    }

    Object.entries(contextTags(props.context)).forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}
