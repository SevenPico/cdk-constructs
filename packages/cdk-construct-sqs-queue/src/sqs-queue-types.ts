import { Context } from '@sevenpico/cdk-context';

export interface SqsIamPolicyStatement {
  readonly sid?: string;
  readonly effect?: string;
  readonly principals?: Record<string, string[]>;
  readonly actions: string[];
  readonly resources?: string[];
  readonly conditions?: Record<string, Record<string, string>>;
}

export interface SqsQueueProps {
  readonly context: Context;

  /** Visibility timeout in seconds (0-43200). Default: 30 */
  readonly visibilityTimeoutSeconds?: number;

  /** Message retention period in seconds (60-1209600). Default: 345600 (4 days) */
  readonly messageRetentionSeconds?: number;

  /** Max message size in bytes (1024-262144). Default: 262144 (256KB) */
  readonly maxMessageSizeBytes?: number;

  /** Message delivery delay in seconds (0-900). Default: 0 */
  readonly delaySeconds?: number;

  /** Long-polling wait time in seconds (0-20). Default: 0 */
  readonly receiveWaitTimeSeconds?: number;

  /** Create a FIFO queue. Default: false */
  readonly fifo?: boolean;

  /** FIFO throughput limit. 'perQueue' | 'perMessageGroupId'. FIFO only. */
  readonly fifoThroughputLimit?: string;

  /** Enable content-based deduplication. FIFO only. Default: false */
  readonly contentBasedDeduplication?: boolean;

  /** KMS key ID for SSE-KMS encryption */
  readonly kmsMasterKeyId?: string;

  /** KMS data key reuse period in seconds. Default: 300 */
  readonly kmsDataKeyReusePeriodSeconds?: number;

  /** Enable SQS-managed SSE (SSE-SQS). Default: true */
  readonly sqsManagedSseEnabled?: boolean;

  /** Enable dead-letter queue. Default: false */
  readonly dlqEnabled?: boolean;

  /** DLQ name suffix appended to the queue's context ID. Default: 'dlq' */
  readonly dlqNameSuffix?: string;

  /** Max receive count before message sent to DLQ. Default: 5 */
  readonly dlqMaxReceiveCount?: number;

  /** KMS key ID for DLQ encryption */
  readonly dlqKmsMasterKeyId?: string;

  /** Enable SQS-managed SSE on DLQ. Default: true */
  readonly dlqSqsManagedSseEnabled?: boolean;

  /** Additional IAM policy statements for the queue resource policy */
  readonly iamPolicyStatements?: SqsIamPolicyStatement[];

  /** Limit queue policy to current AWS account. Default: true */
  readonly iamPolicyLimitToCurrentAccount?: boolean;
}
