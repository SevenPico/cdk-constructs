import { contextTags, isEnabled } from '@sevenpico/cdk-context';
import { Tags, aws_sqs as sqs, aws_kms as kms, aws_iam as iam, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { sqsQueueProps, sqsDlqProps, buildPolicyStatement } from './sqs-queue-fns';
import { SqsQueueProps } from './sqs-queue-types';

export class SqsQueue extends Construct {
  public readonly queue?: sqs.Queue;
  public readonly deadLetterQueue?: sqs.Queue;

  constructor(scope: Construct, id: string, props: SqsQueueProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    // DLQ first (referenced by main queue)
    if (props.dlqEnabled) {
      const dlqEncKey = props.dlqKmsMasterKeyId
        ? kms.Key.fromKeyArn(this, 'DlqKey', props.dlqKmsMasterKeyId)
        : undefined;

      this.deadLetterQueue = new sqs.Queue(this, 'Dlq', {
        ...sqsDlqProps(props.context, props),
        encryptionMasterKey: dlqEncKey,
      });
    }

    const encKey = props.kmsMasterKeyId
      ? kms.Key.fromKeyArn(this, 'Key', props.kmsMasterKeyId)
      : undefined;

    this.queue = new sqs.Queue(this, 'Queue', {
      ...sqsQueueProps(props.context, props, this.deadLetterQueue),
      encryptionMasterKey: encKey,
    });

    // FIFO throughput limit via CfnQueue escape hatch (not exposed on L2)
    if (props.fifo && props.fifoThroughputLimit) {
      const cfnQueue = this.queue.node.defaultChild as sqs.CfnQueue;
      cfnQueue.addPropertyOverride('FifoThroughputLimit', props.fifoThroughputLimit);
    }

    (props.iamPolicyStatements ?? []).forEach(stmt => {
      this.queue!.addToResourcePolicy(buildPolicyStatement(stmt));
    });

    if (props.iamPolicyLimitToCurrentAccount !== false) {
      this.queue!.addToResourcePolicy(new iam.PolicyStatement({
        effect: iam.Effect.DENY,
        principals: [new iam.AnyPrincipal()],
        actions: ['sqs:*'],
        resources: [this.queue!.queueArn],
        conditions: {
          StringNotEquals: {
            'aws:SourceAccount': Stack.of(this).account,
          },
        },
      }));
    }

    Object.entries(contextTags(props.context)).forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}
