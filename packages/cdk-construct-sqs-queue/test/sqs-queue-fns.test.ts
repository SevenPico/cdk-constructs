import { makeContext } from '@sevenpico/cdk-context';
import { aws_sqs as sqs, Duration } from 'aws-cdk-lib';
import { queueName, dlqName, queueEncryption, sqsQueueProps, sqsDlqProps, buildPolicyStatement } from '../src/sqs-queue-fns';

describe('queueName', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'orders' });

  test('defaults to context id', () => {
    expect(queueName(ctx, { context: ctx })).toBe('7p-prod-orders');
  });

  test('appends .fifo suffix for FIFO queues', () => {
    expect(queueName(ctx, { context: ctx, fifo: true })).toBe('7p-prod-orders.fifo');
  });
});

describe('dlqName', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'orders' });

  test('appends dlq suffix by default', () => {
    expect(dlqName(ctx, { context: ctx })).toBe('7p-prod-orders-dlq');
  });

  test('uses custom dlqNameSuffix', () => {
    expect(dlqName(ctx, { context: ctx, dlqNameSuffix: 'dead' })).toBe('7p-prod-orders-dead');
  });

  test('appends .fifo for FIFO queues', () => {
    expect(dlqName(ctx, { context: ctx, fifo: true })).toBe('7p-prod-orders-dlq.fifo');
  });
});

describe('queueEncryption', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'orders' });

  test('returns KMS when kmsMasterKeyId provided', () => {
    expect(queueEncryption({ context: ctx, kmsMasterKeyId: 'arn:aws:kms:us-east-1:123:key/test' }))
      .toBe(sqs.QueueEncryption.KMS);
  });

  test('returns SQS_MANAGED by default', () => {
    expect(queueEncryption({ context: ctx })).toBe(sqs.QueueEncryption.SQS_MANAGED);
  });

  test('returns UNENCRYPTED when sqsManagedSseEnabled is false', () => {
    expect(queueEncryption({ context: ctx, sqsManagedSseEnabled: false }))
      .toBe(sqs.QueueEncryption.UNENCRYPTED);
  });
});

describe('sqsQueueProps', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'orders' });

  test('sets queue name from context', () => {
    const props = sqsQueueProps(ctx, { context: ctx });
    expect(props.queueName).toBe('7p-prod-orders');
  });

  test('defaults visibility timeout to 30 seconds', () => {
    const props = sqsQueueProps(ctx, { context: ctx });
    expect(props.visibilityTimeout).toEqual(Duration.seconds(30));
  });

  test('uses custom visibility timeout', () => {
    const props = sqsQueueProps(ctx, { context: ctx, visibilityTimeoutSeconds: 60 });
    expect(props.visibilityTimeout).toEqual(Duration.seconds(60));
  });

  test('defaults retention period to 345600 seconds', () => {
    const props = sqsQueueProps(ctx, { context: ctx });
    expect(props.retentionPeriod).toEqual(Duration.seconds(345600));
  });

  test('defaults max message size to 262144', () => {
    const props = sqsQueueProps(ctx, { context: ctx });
    expect(props.maxMessageSizeBytes).toBe(262144);
  });

  test('defaults fifo to false', () => {
    const props = sqsQueueProps(ctx, { context: ctx });
    expect(props.fifo).toBe(false);
  });

  test('sets fifo when specified', () => {
    const props = sqsQueueProps(ctx, { context: ctx, fifo: true });
    expect(props.fifo).toBe(true);
  });

  test('defaults contentBasedDeduplication to false', () => {
    const props = sqsQueueProps(ctx, { context: ctx });
    expect(props.contentBasedDeduplication).toBe(false);
  });

  test('sets deadLetterQueue when provided', () => {
    const mockDlq = {} as sqs.IQueue;
    const props = sqsQueueProps(ctx, { context: ctx, dlqMaxReceiveCount: 3 }, mockDlq);
    expect(props.deadLetterQueue).toEqual({
      queue: mockDlq,
      maxReceiveCount: 3,
    });
  });

  test('no deadLetterQueue when not provided', () => {
    const props = sqsQueueProps(ctx, { context: ctx });
    expect(props.deadLetterQueue).toBeUndefined();
  });
});

describe('sqsDlqProps', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'orders' });

  test('sets DLQ name with suffix', () => {
    const props = sqsDlqProps(ctx, { context: ctx });
    expect(props.queueName).toBe('7p-prod-orders-dlq');
  });

  test('sets fifo from main queue props', () => {
    const props = sqsDlqProps(ctx, { context: ctx, fifo: true });
    expect(props.fifo).toBe(true);
  });

  test('defaults retention period to 7 days', () => {
    const props = sqsDlqProps(ctx, { context: ctx });
    expect(props.retentionPeriod).toEqual(Duration.days(7));
  });

  test('uses KMS encryption when dlqKmsMasterKeyId provided', () => {
    const props = sqsDlqProps(ctx, { context: ctx, dlqKmsMasterKeyId: 'arn:aws:kms:us-east-1:123:key/test' });
    expect(props.encryption).toBe(sqs.QueueEncryption.KMS);
  });

  test('uses SQS_MANAGED encryption by default', () => {
    const props = sqsDlqProps(ctx, { context: ctx });
    expect(props.encryption).toBe(sqs.QueueEncryption.SQS_MANAGED);
  });
});

describe('buildPolicyStatement', () => {
  test('creates Allow policy statement', () => {
    const stmt = buildPolicyStatement({
      sid: 'AllowSend',
      effect: 'Allow',
      actions: ['sqs:SendMessage'],
      principals: { Service: ['events.amazonaws.com'] },
    });
    expect(stmt.sid).toBe('AllowSend');
  });

  test('creates Deny policy statement', () => {
    const stmt = buildPolicyStatement({
      sid: 'DenyAll',
      effect: 'Deny',
      actions: ['sqs:*'],
    });
    expect(stmt.effect.toString()).toBe('Deny');
  });
});
