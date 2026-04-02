import { makeContext } from '@sevenpico/cdk-context';
import { aws_kinesis as kinesis } from 'aws-cdk-lib';
import {
  streamMode,
  streamEncryption,
  kinesisStreamProps,
  mapShardLevelMetrics,
  consumerName,
} from '../src/kinesis-stream-fns';
import { KinesisStreamProps } from '../src/kinesis-stream-types';

const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'events' });

const baseProps: KinesisStreamProps = { context: ctx };

describe('streamMode', () => {
  test('returns PROVISIONED by default', () => {
    expect(streamMode(baseProps)).toBe(kinesis.StreamMode.PROVISIONED);
  });

  test('returns ON_DEMAND when specified', () => {
    expect(streamMode({ ...baseProps, streamMode: 'ON_DEMAND' })).toBe(kinesis.StreamMode.ON_DEMAND);
  });

  test('returns PROVISIONED for unknown value', () => {
    expect(streamMode({ ...baseProps, streamMode: 'UNKNOWN' })).toBe(kinesis.StreamMode.PROVISIONED);
  });
});

describe('streamEncryption', () => {
  test('returns MANAGED by default (aws/kinesis key)', () => {
    expect(streamEncryption(baseProps)).toBe(kinesis.StreamEncryption.MANAGED);
  });

  test('returns UNENCRYPTED when NONE', () => {
    expect(streamEncryption({ ...baseProps, encryptionType: 'NONE' })).toBe(kinesis.StreamEncryption.UNENCRYPTED);
  });

  test('returns KMS when custom kmsKeyId provided', () => {
    expect(streamEncryption({ ...baseProps, kmsKeyId: 'arn:aws:kms:us-east-1:123456789012:key/abc' }))
      .toBe(kinesis.StreamEncryption.KMS);
  });

  test('returns MANAGED when kmsKeyId is alias/aws/kinesis', () => {
    expect(streamEncryption({ ...baseProps, kmsKeyId: 'alias/aws/kinesis' }))
      .toBe(kinesis.StreamEncryption.MANAGED);
  });
});

describe('kinesisStreamProps', () => {
  test('uses context ID as stream name', () => {
    expect(kinesisStreamProps(ctx, baseProps).streamName).toBe('7p-prod-events');
  });

  test('defaults to 1 shard in PROVISIONED mode', () => {
    expect(kinesisStreamProps(ctx, baseProps).shardCount).toBe(1);
  });

  test('shard count is undefined in ON_DEMAND mode', () => {
    expect(kinesisStreamProps(ctx, { ...baseProps, streamMode: 'ON_DEMAND' }).shardCount).toBeUndefined();
  });

  test('shard count ignored even if set in ON_DEMAND mode', () => {
    expect(kinesisStreamProps(ctx, { ...baseProps, streamMode: 'ON_DEMAND', shardCount: 10 }).shardCount).toBeUndefined();
  });

  test('defaults to 24 hour retention', () => {
    const props = kinesisStreamProps(ctx, baseProps);
    expect(props.retentionPeriod?.toHours()).toBe(24);
  });

  test('uses custom retention hours', () => {
    const props = kinesisStreamProps(ctx, { ...baseProps, retentionPeriodHours: 168 });
    expect(props.retentionPeriod?.toHours()).toBe(168);
  });
});

describe('mapShardLevelMetrics', () => {
  test('defaults to IncomingBytes and OutgoingBytes', () => {
    expect(mapShardLevelMetrics(baseProps)).toEqual(['IncomingBytes', 'OutgoingBytes']);
  });

  test('maps custom metrics', () => {
    const metrics = mapShardLevelMetrics({ ...baseProps, shardLevelMetrics: ['IncomingRecords', 'IteratorAgeMilliseconds'] });
    expect(metrics).toEqual(['IncomingRecords', 'IteratorAgeMilliseconds']);
  });

  test('filters out unknown metrics', () => {
    const metrics = mapShardLevelMetrics({ ...baseProps, shardLevelMetrics: ['IncomingBytes', 'UnknownMetric'] });
    expect(metrics).toEqual(['IncomingBytes']);
  });
});

describe('consumerName', () => {
  test('uses context ID with index', () => {
    expect(consumerName(ctx, 0)).toBe('7p-prod-events-consumer-0');
    expect(consumerName(ctx, 1)).toBe('7p-prod-events-consumer-1');
  });
});
