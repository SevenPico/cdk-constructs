import { Context, contextId, extendContext } from '@sevenpico/cdk-context';
import { aws_sqs as sqs, aws_iam as iam, Duration } from 'aws-cdk-lib';
import { SqsQueueProps, SqsIamPolicyStatement } from './sqs-queue-types';

export const queueName = (ctx: Context, props: SqsQueueProps): string =>
  props.fifo ? `${contextId(ctx)}.fifo` : contextId(ctx);

export const dlqContext = (ctx: Context, props: SqsQueueProps): Context =>
  extendContext(ctx, { attributes: [props.dlqNameSuffix ?? 'dlq'] });

export const dlqName = (ctx: Context, props: SqsQueueProps): string => {
  const dCtx = dlqContext(ctx, props);
  return props.fifo ? `${contextId(dCtx)}.fifo` : contextId(dCtx);
};

export const queueEncryption = (props: SqsQueueProps): sqs.QueueEncryption => {
  if (props.kmsMasterKeyId) return sqs.QueueEncryption.KMS;
  if (props.sqsManagedSseEnabled !== false) return sqs.QueueEncryption.SQS_MANAGED;
  return sqs.QueueEncryption.UNENCRYPTED;
};

export const sqsQueueProps = (
  ctx: Context,
  props: SqsQueueProps,
  deadLetterQueue?: sqs.IQueue,
): sqs.QueueProps => ({
  queueName: queueName(ctx, props),
  visibilityTimeout: Duration.seconds(props.visibilityTimeoutSeconds ?? 30),
  retentionPeriod: Duration.seconds(props.messageRetentionSeconds ?? 345600),
  maxMessageSizeBytes: props.maxMessageSizeBytes ?? 262144,
  deliveryDelay: Duration.seconds(props.delaySeconds ?? 0),
  receiveMessageWaitTime: Duration.seconds(props.receiveWaitTimeSeconds ?? 0),
  fifo: props.fifo ?? false,
  contentBasedDeduplication: props.contentBasedDeduplication ?? false,
  encryption: queueEncryption(props),
  dataKeyReuse: props.kmsMasterKeyId
    ? Duration.seconds(props.kmsDataKeyReusePeriodSeconds ?? 300)
    : undefined,
  deadLetterQueue: deadLetterQueue ? {
    queue: deadLetterQueue,
    maxReceiveCount: props.dlqMaxReceiveCount ?? 5,
  } : undefined,
});

export const sqsDlqProps = (ctx: Context, props: SqsQueueProps): sqs.QueueProps => ({
  queueName: dlqName(ctx, props),
  fifo: props.fifo ?? false,
  encryption: props.dlqKmsMasterKeyId
    ? sqs.QueueEncryption.KMS
    : (props.dlqSqsManagedSseEnabled !== false ? sqs.QueueEncryption.SQS_MANAGED : sqs.QueueEncryption.UNENCRYPTED),
  retentionPeriod: Duration.days(7),
});

export const buildPolicyStatement = (stmt: SqsIamPolicyStatement): iam.PolicyStatement => {
  const principals: iam.IPrincipal[] = [];
  if (stmt.principals) {
    for (const [type, ids] of Object.entries(stmt.principals)) {
      for (const id of ids) {
        if (type === 'Service') principals.push(new iam.ServicePrincipal(id));
        else principals.push(new iam.ArnPrincipal(id));
      }
    }
  }
  return new iam.PolicyStatement({
    sid: stmt.sid,
    effect: stmt.effect === 'Deny' ? iam.Effect.DENY : iam.Effect.ALLOW,
    principals: principals.length > 0 ? principals : undefined,
    actions: stmt.actions,
    resources: stmt.resources,
    conditions: stmt.conditions,
  });
};
