import { makeContext } from '@sevenpico/cdk-context';
import { aws_sqs as sqs, Duration } from 'aws-cdk-lib';
import { topicName, dlqContext, snsTopicProps, dlqProps } from '../src/sns-fns';

describe('topicName', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'alerts' });

  test('defaults to context id', () => {
    expect(topicName(ctx, { context: ctx })).toBe('7p-prod-alerts');
  });

  test('appends .fifo suffix for FIFO topics', () => {
    expect(topicName(ctx, { context: ctx, fifoTopic: true })).toBe('7p-prod-alerts.fifo');
  });
});

describe('dlqContext', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'alerts' });

  test('extends context with dlq attribute', () => {
    const dCtx = dlqContext(ctx);
    expect(dCtx).toBeDefined();
  });
});

describe('snsTopicProps', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'alerts' });

  test('sets topic name from context', () => {
    const props = snsTopicProps(ctx, { context: ctx });
    expect(props.topicName).toBe('7p-prod-alerts');
  });

  test('defaults fifo to false', () => {
    const props = snsTopicProps(ctx, { context: ctx });
    expect(props.fifo).toBe(false);
  });

  test('sets fifo when specified', () => {
    const props = snsTopicProps(ctx, { context: ctx, fifoTopic: true });
    expect(props.fifo).toBe(true);
  });

  test('defaults contentBasedDeduplication to false', () => {
    const props = snsTopicProps(ctx, { context: ctx });
    expect(props.contentBasedDeduplication).toBe(false);
  });

  test('sets contentBasedDeduplication when specified', () => {
    const props = snsTopicProps(ctx, { context: ctx, contentBasedDeduplication: true });
    expect(props.contentBasedDeduplication).toBe(true);
  });
});

describe('dlqProps', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'alerts' });

  test('sets DLQ name with dlq suffix', () => {
    const props = dlqProps(ctx, { context: ctx });
    expect(props.queueName).toBe('7p-prod-alerts-dlq');
  });

  test('sets FIFO DLQ name with .fifo suffix', () => {
    const props = dlqProps(ctx, { context: ctx, sqsDlqFifo: true });
    expect(props.queueName).toBe('7p-prod-alerts-dlq.fifo');
  });

  test('defaults fifo to false', () => {
    const props = dlqProps(ctx, { context: ctx });
    expect(props.fifo).toBe(false);
  });

  test('defaults maxMessageSizeBytes to 262144', () => {
    const props = dlqProps(ctx, { context: ctx });
    expect(props.maxMessageSizeBytes).toBe(262144);
  });

  test('uses custom maxMessageSizeBytes', () => {
    const props = dlqProps(ctx, { context: ctx, sqsDlqMaxMessageSizeBytes: 1024 });
    expect(props.maxMessageSizeBytes).toBe(1024);
  });

  test('defaults retention to 1209600 seconds', () => {
    const props = dlqProps(ctx, { context: ctx });
    expect(props.retentionPeriod).toEqual(Duration.seconds(1209600));
  });

  test('uses custom retention period', () => {
    const props = dlqProps(ctx, { context: ctx, sqsDlqMessageRetentionSeconds: 3600 });
    expect(props.retentionPeriod).toEqual(Duration.seconds(3600));
  });

  test('uses KMS encryption when key provided', () => {
    const props = dlqProps(ctx, { context: ctx, sqsQueueKmsMasterKeyId: 'arn:aws:kms:us-east-1:123:key/test' });
    expect(props.encryption).toBe(sqs.QueueEncryption.KMS);
  });

  test('uses SQS_MANAGED encryption by default', () => {
    const props = dlqProps(ctx, { context: ctx });
    expect(props.encryption).toBe(sqs.QueueEncryption.SQS_MANAGED);
  });
});
