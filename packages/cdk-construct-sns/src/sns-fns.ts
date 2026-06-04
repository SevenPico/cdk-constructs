import { Context, contextId, extendContext } from '@sevenpico/cdk-context';
import { aws_sns as sns, aws_sqs as sqs, Duration } from 'aws-cdk-lib';
import { SnsProps } from './sns-types';

export const topicName = (ctx: Context, props: SnsProps): string =>
  props.fifoTopic ? `${contextId(ctx)}.fifo` : contextId(ctx);

export const dlqContext = (ctx: Context): Context =>
  extendContext(ctx, { attributes: ['dlq'] });

export const snsTopicProps = (ctx: Context, props: SnsProps): sns.TopicProps => ({
  topicName: topicName(ctx, props),
  fifo: props.fifoTopic ?? false,
  contentBasedDeduplication: props.contentBasedDeduplication ?? false,
});

export const dlqProps = (ctx: Context, props: SnsProps): sqs.QueueProps => {
  const dCtx = dlqContext(ctx);
  return {
    queueName: props.sqsDlqFifo ? `${contextId(dCtx)}.fifo` : contextId(dCtx),
    fifo: props.sqsDlqFifo ?? false,
    maxMessageSizeBytes: props.sqsDlqMaxMessageSizeBytes ?? 262144,
    retentionPeriod: Duration.seconds(props.sqsDlqMessageRetentionSeconds ?? 1209600),
    encryption: props.sqsQueueKmsMasterKeyId
      ? sqs.QueueEncryption.KMS
      : sqs.QueueEncryption.SQS_MANAGED,
  };
};
