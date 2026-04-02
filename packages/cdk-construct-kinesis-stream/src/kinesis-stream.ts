import { Construct } from 'constructs';
import {
  Tags,
  RemovalPolicy,
  aws_kinesis as kinesis,
  aws_kms as kms,
} from 'aws-cdk-lib';
import { contextTags, isEnabled } from '@sevenpico/cdk-context';
import { KinesisStreamProps } from './kinesis-stream-types';
import {
  kinesisStreamProps,
  consumerName,
  mapShardLevelMetrics,
  enforceConsumerDeletion,
} from './kinesis-stream-fns';

export class KinesisStream extends Construct {
  public readonly stream?: kinesis.Stream;

  constructor(scope: Construct, id: string, props: KinesisStreamProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    // Resolve KMS key: ARNs use fromKeyArn, aliases use CfnStream property override
    const kmsKeyId = props.kmsKeyId ?? 'alias/aws/kinesis';
    const isArn = kmsKeyId.startsWith('arn:');
    const encKey = (props.encryptionType !== 'NONE' && isArn)
      ? kms.Key.fromKeyArn(this, 'Key', kmsKeyId)
      : undefined;

    this.stream = new kinesis.Stream(this, 'Stream', {
      ...kinesisStreamProps(props.context, props),
      encryptionKey: encKey,
    });

    const cfnStream = this.stream.node.defaultChild as kinesis.CfnStream;

    // For alias-based custom KMS keys, override via CfnStream escape hatch
    if (props.encryptionType !== 'NONE' && !isArn && kmsKeyId !== 'alias/aws/kinesis') {
      cfnStream.addPropertyOverride('StreamEncryption.EncryptionType', 'KMS');
      cfnStream.addPropertyOverride('StreamEncryption.KeyId', kmsKeyId);
    }

    // Shard-level metrics via CfnStream escape hatch (not in L2 StreamProps for CDK 2.246)
    const metrics = mapShardLevelMetrics(props);
    if (metrics.length > 0) {
      cfnStream.addPropertyOverride('EnhancedMonitoring', [
        { ShardLevelMetrics: metrics },
      ]);
    }

    // enforceConsumerDeletion: when false, retain stream on deletion to avoid consumer conflicts
    if (!enforceConsumerDeletion(props)) {
      this.stream.applyRemovalPolicy(RemovalPolicy.RETAIN);
    }

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
