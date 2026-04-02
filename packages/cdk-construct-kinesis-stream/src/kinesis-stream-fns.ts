import { aws_kinesis as kinesis, Duration } from 'aws-cdk-lib';
import { Context, contextId } from '@sevenpico/cdk-context';
import { KinesisStreamProps } from './kinesis-stream-types';

export const streamMode = (props: KinesisStreamProps): kinesis.StreamMode =>
  props.streamMode === 'ON_DEMAND'
    ? kinesis.StreamMode.ON_DEMAND
    : kinesis.StreamMode.PROVISIONED;

export const streamEncryption = (props: KinesisStreamProps): kinesis.StreamEncryption => {
  if (props.encryptionType === 'NONE') return kinesis.StreamEncryption.UNENCRYPTED;
  if (props.kmsKeyId && props.kmsKeyId !== 'alias/aws/kinesis') return kinesis.StreamEncryption.KMS;
  return kinesis.StreamEncryption.MANAGED;
};

export const kinesisStreamProps = (ctx: Context, props: KinesisStreamProps): kinesis.StreamProps => ({
  streamName: contextId(ctx),
  shardCount: streamMode(props) === kinesis.StreamMode.PROVISIONED
    ? (props.shardCount ?? 1)
    : undefined,
  streamMode: streamMode(props),
  retentionPeriod: Duration.hours(props.retentionPeriodHours ?? 24),
  encryption: streamEncryption(props),
});

export const enforceConsumerDeletion = (props: KinesisStreamProps): boolean =>
  props.enforceConsumerDeletion ?? true;

export const consumerName = (ctx: Context, index: number): string =>
  `${contextId(ctx)}-consumer-${index}`;

/** Maps user-facing shard-level metric names to CloudFormation metric strings.
 * Note: shard-level metrics are applied via CfnStream escape hatch since the
 * L2 Stream construct in CDK 2.246 does not support shardLevelMetrics prop. */
export const mapShardLevelMetrics = (props: KinesisStreamProps): string[] =>
  (props.shardLevelMetrics ?? ['IncomingBytes', 'OutgoingBytes'])
    .filter(m => VALID_SHARD_METRICS.has(m));

const VALID_SHARD_METRICS = new Set([
  'IncomingBytes',
  'OutgoingBytes',
  'IncomingRecords',
  'OutgoingRecords',
  'WriteProvisionedThroughputExceeded',
  'ReadProvisionedThroughputExceeded',
  'IteratorAgeMilliseconds',
]);
