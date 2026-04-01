import { Context } from '@sevenpico/cdk-context';

export interface S3CorsRule {
  readonly allowedMethods: string[];
  readonly allowedOrigins: string[];
  readonly allowedHeaders?: string[];
  readonly exposedHeaders?: string[];
  readonly maxAge?: number;
}

export interface S3LifecycleTransition {
  readonly storageClass: string;
  readonly transitionAfterDays: number;
}

export interface S3LifecycleRule {
  readonly id?: string;
  readonly enabled?: boolean;
  readonly prefix?: string;
  readonly expirationDays?: number;
  readonly noncurrentVersionExpirationDays?: number;
  readonly transitions?: S3LifecycleTransition[];
  readonly noncurrentVersionTransitions?: S3LifecycleTransition[];
  readonly abortIncompleteMultipartUploadAfterDays?: number;
}

export interface S3ReplicationRule {
  readonly destinationBucketArn: string;
  readonly destinationStorageClass?: string;
  readonly prefix?: string;
  readonly status?: string;
}

export interface S3BucketProps {
  readonly context: Context;

  /** Override the bucket name. Default: context.id */
  readonly bucketName?: string;

  /** Enable versioning. Default: true */
  readonly versioningEnabled?: boolean;

  /** SSE algorithm. 'AES256' | 'aws:kms'. Default: 'AES256' */
  readonly sseAlgorithm?: string;

  /** KMS key ARN for SSE-KMS encryption */
  readonly kmsKeyArn?: string;

  /** Enable S3 bucket key to reduce KMS costs. Default: false */
  readonly bucketKeyEnabled?: boolean;

  /** Block public ACLs. Default: true */
  readonly blockPublicAcls?: boolean;

  /** Block public bucket policies. Default: true */
  readonly blockPublicPolicy?: boolean;

  /** Ignore public ACLs. Default: true */
  readonly ignorePublicAcls?: boolean;

  /** Restrict public buckets. Default: true */
  readonly restrictPublicBuckets?: boolean;

  /** Force destroy even with objects. Default: false */
  readonly forceDestroy?: boolean;

  /** Lifecycle rules */
  readonly lifecycleRules?: S3LifecycleRule[];

  /** CORS rules */
  readonly corsRules?: S3CorsRule[];

  /** Object ownership. Default: 'BucketOwnerEnforced' */
  readonly objectOwnership?: string;

  /** Enable transfer acceleration. Default: false */
  readonly transferAccelerationEnabled?: boolean;

  /** Enable MFA delete (requires versioning). Default: false */
  readonly mfaDeleteEnabled?: boolean;

  /** Cross-region replication rules */
  readonly replicationRules?: S3ReplicationRule[];

  /** IAM role ARN for replication (required if replicationRules provided) */
  readonly replicationRoleArn?: string;

  /** Logging target bucket name */
  readonly loggingBucketName?: string;

  /** Logging target prefix */
  readonly loggingPrefix?: string;

  /** Additional IAM policy documents to merge into bucket policy (JSON strings) */
  readonly sourcePolicyDocuments?: string[];

  /** Enforce encrypted uploads only. Default: false */
  readonly allowEncryptedUploadsOnly?: boolean;

  /** Enforce SSL/TLS requests only. Default: false */
  readonly allowSslRequestsOnly?: boolean;

  /** Object lock mode. 'GOVERNANCE' | 'COMPLIANCE' */
  readonly objectLockMode?: string;

  /** Object lock retention days */
  readonly objectLockRetentionDays?: number;

  /** Object lock retention years */
  readonly objectLockRetentionYears?: number;
}
