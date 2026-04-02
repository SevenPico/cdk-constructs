import { Context } from '@sevenpico/cdk-context';

export interface KinesisStreamProps {
  readonly context: Context;

  /** Number of shards. Ignored in ON_DEMAND mode. Default: 1 */
  readonly shardCount?: number;

  /** Data retention in hours (24-168). Default: 24 */
  readonly retentionPeriodHours?: number;

  /** Shard-level CloudWatch metrics to enable. Default: ['IncomingBytes', 'OutgoingBytes'] */
  readonly shardLevelMetrics?: string[];

  /** Deregister consumers before stream deletion. Default: true */
  readonly enforceConsumerDeletion?: boolean;

  /** Encryption type. 'KMS' | 'NONE'. Default: 'KMS' */
  readonly encryptionType?: string;

  /** KMS key ID or alias. Default: 'alias/aws/kinesis' */
  readonly kmsKeyId?: string;

  /** Stream capacity mode. 'PROVISIONED' | 'ON_DEMAND'. Default: 'PROVISIONED' */
  readonly streamMode?: string;

  /** Number of registered stream consumers to create. Default: 0 */
  readonly consumerCount?: number;
}
