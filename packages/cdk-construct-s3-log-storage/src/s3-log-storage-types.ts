import { S3LifecycleRule } from '@sevenpico/cdk-construct-s3-bucket';
import { Context } from '@sevenpico/cdk-context';

export interface S3LogStorageProps {
  readonly context: Context;

  /** Override the bucket name. Default: context.id */
  readonly bucketName?: string;

  /** Enable versioning. Default: true */
  readonly versioningEnabled?: boolean;

  /** SSE algorithm. Default: 'AES256' */
  readonly sseAlgorithm?: string;

  /** KMS key ARN for SSE-KMS */
  readonly kmsKeyArn?: string;

  /** Enable S3 bucket key. Default: false */
  readonly bucketKeyEnabled?: boolean;

  /** Block public ACLs. Default: true */
  readonly blockPublicAcls?: boolean;

  /** Block public bucket policies. Default: true */
  readonly blockPublicPolicy?: boolean;

  /** Ignore public ACLs. Default: true */
  readonly ignorePublicAcls?: boolean;

  /** Restrict public buckets. Default: true */
  readonly restrictPublicBuckets?: boolean;

  /** Force destroy. Default: false */
  readonly forceDestroy?: boolean;

  /** Enforce SSL-only requests. Default: true */
  readonly allowSslRequestsOnly?: boolean;

  /** Additional IAM policy documents (JSON strings) */
  readonly sourcePolicyDocuments?: string[];

  /** S3 object ownership. Default: 'ObjectWriter' */
  readonly objectOwnership?: string;

  /** Lifecycle rules */
  readonly lifecycleRules?: S3LifecycleRule[];

  /** Logging target bucket name (for access logs of this bucket) */
  readonly accessLogBucketName?: string;

  /** Logging prefix */
  readonly accessLogPrefix?: string;

  /** Enable bucket event notifications. Default: false */
  readonly notificationsEnabled?: boolean;

  /** Notification target type. Default: 'SQS' */
  readonly notificationsType?: string;

  /** S3 key prefix filter for notifications */
  readonly notificationsPrefix?: string;

  /** Enable MFA delete. Default: false */
  readonly mfaDeleteEnabled?: boolean;
}
