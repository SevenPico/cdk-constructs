import { makeContext } from '@sevenpico/cdk-context';
import { aws_sqs as sqs } from 'aws-cdk-lib';
import { queueName, dlqName, queueEncryption, sqsQueueProps } from '../src/sqs-queue-fns';

describe('queueName', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'orders' });

  test('defaults to context id', () => {
    expect(queueName(ctx, { context: ctx })).toBe('7p-prod-orders');
  });

  test('appends .fifo for FIFO queues', () => {
    expect(queueName(ctx, { context: ctx, fifo: true })).toBe('7p-prod-orders.fifo');
  });
});

describe('dlqName', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'orders' });

  test('extends context with dlq suffix', () => {
    expect(dlqName(ctx, { context: ctx })).toBe('7p-prod-orders-dlq');
  });

  test('uses custom suffix', () => {
    expect(dlqName(ctx, { context: ctx, dlqNameSuffix: 'dead' })).toBe('7p-prod-orders-dead');
  });
});

describe('queueEncryption', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'orders' });

  test('defaults to SQS_MANAGED', () => {
    expect(queueEncryption({ context: ctx })).toBe(sqs.QueueEncryption.SQS_MANAGED);
  });

  test('returns KMS when kmsMasterKeyId provided', () => {
    expect(queueEncryption({ context: ctx, kmsMasterKeyId: 'key-id' })).toBe(sqs.QueueEncryption.KMS);
  });

  test('returns UNENCRYPTED when sqsManagedSseEnabled is false', () => {
    expect(queueEncryption({ context: ctx, sqsManagedSseEnabled: false })).toBe(sqs.QueueEncryption.UNENCRYPTED);
  });
});

describe('sqsQueueProps', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'orders' });

  test('visibility timeout defaults to 30 seconds', () => {
    const props = sqsQueueProps(ctx, { context: ctx });
    expect(props.visibilityTimeout?.toSeconds()).toBe(30);
  });

  test('retention period defaults to 4 days', () => {
    const props = sqsQueueProps(ctx, { context: ctx });
    expect(props.retentionPeriod?.toSeconds()).toBe(345600);
  });
});
