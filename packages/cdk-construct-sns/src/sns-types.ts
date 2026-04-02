import { Context } from '@sevenpico/cdk-context';

export interface SnsSubscriber {
  /** Subscription protocol: 'sqs' | 'lambda' | 'http' | 'https' | 'email' | 'sms' */
  readonly protocol: string;
  /** Endpoint ARN/URL/email address */
  readonly endpoint: string;
  /** Enable raw message delivery. Default: false */
  readonly rawMessageDelivery?: boolean;
}

export interface SnsProps {
  readonly context: Context;

  /** Enable KMS encryption. Default: true */
  readonly encryptionEnabled?: boolean;

  /** KMS key ARN for SNS encryption */
  readonly kmsMasterKeyId?: string;

  /** Create FIFO topic. Default: false */
  readonly fifoTopic?: boolean;

  /** Enable content-based deduplication (FIFO only). Default: false */
  readonly contentBasedDeduplication?: boolean;

  /** Map of subscriber name to subscriber config */
  readonly subscribers?: Record<string, SnsSubscriber>;

  /** AWS service identifiers allowed to publish */
  readonly allowedAwsServicesForPublish?: string[];

  /** IAM ARNs allowed to publish to the topic */
  readonly allowedIamArnsForPublish?: string[];

  /** Custom SNS topic policy JSON (overrides generated policy) */
  readonly snsTopicPolicyJson?: string;

  /** Enable SQS dead-letter queue for failed deliveries. Default: false */
  readonly sqsDlqEnabled?: boolean;

  /** DLQ max message size in bytes. Default: 262144 */
  readonly sqsDlqMaxMessageSizeBytes?: number;

  /** DLQ message retention seconds. Default: 1209600 (14 days) */
  readonly sqsDlqMessageRetentionSeconds?: number;

  /** Create FIFO DLQ. Default: false */
  readonly sqsDlqFifo?: boolean;

  /** KMS key ID for DLQ */
  readonly sqsQueueKmsMasterKeyId?: string;

  /** KMS data key reuse period for DLQ in seconds. Default: 300 */
  readonly sqsQueueKmsDataKeyReusePeriodSeconds?: number;

  /** Custom SNS delivery retry policy JSON */
  readonly deliveryPolicy?: string;

  /** Custom redrive policy JSON */
  readonly redrivePolicy?: string;

  /** Max receive count for redrive policy. Default: 5 */
  readonly redriveMaxReceiverCount?: number;
}
