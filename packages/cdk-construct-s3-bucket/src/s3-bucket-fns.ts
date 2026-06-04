import { Context, contextId } from '@sevenpico/cdk-context';
import { aws_s3 as s3, Duration, RemovalPolicy } from 'aws-cdk-lib';
import { S3BucketProps, S3CorsRule, S3LifecycleRule } from './s3-bucket-types';

export const s3BucketName = (ctx: Context, props: S3BucketProps): string =>
  props.bucketName ?? contextId(ctx);

export const s3EncryptionConfig = (props: S3BucketProps): s3.BucketEncryption => {
  if (props.sseAlgorithm === 'aws:kms' || props.kmsKeyArn) return s3.BucketEncryption.KMS;
  return s3.BucketEncryption.S3_MANAGED;
};

export const mapObjectOwnership = (value: string): s3.ObjectOwnership => {
  const mapping: Record<string, s3.ObjectOwnership> = {
    BucketOwnerEnforced: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
    BucketOwnerPreferred: s3.ObjectOwnership.BUCKET_OWNER_PREFERRED,
    ObjectWriter: s3.ObjectOwnership.OBJECT_WRITER,
  };
  return mapping[value] ?? s3.ObjectOwnership.BUCKET_OWNER_ENFORCED;
};

export const mapStorageClass = (value: string): s3.StorageClass => {
  const mapping: Record<string, s3.StorageClass> = {
    GLACIER: s3.StorageClass.GLACIER,
    DEEP_ARCHIVE: s3.StorageClass.DEEP_ARCHIVE,
    STANDARD_IA: s3.StorageClass.INFREQUENT_ACCESS,
    ONEZONE_IA: s3.StorageClass.ONE_ZONE_INFREQUENT_ACCESS,
    INTELLIGENT_TIERING: s3.StorageClass.INTELLIGENT_TIERING,
    GLACIER_IR: s3.StorageClass.GLACIER_INSTANT_RETRIEVAL,
  };
  return mapping[value] ?? new s3.StorageClass(value);
};

export const mapLifecycleRule = (r: S3LifecycleRule): s3.LifecycleRule => ({
  id: r.id,
  enabled: r.enabled ?? true,
  prefix: r.prefix,
  expiration: r.expirationDays !== undefined ? Duration.days(r.expirationDays) : undefined,
  noncurrentVersionExpiration: r.noncurrentVersionExpirationDays !== undefined
    ? Duration.days(r.noncurrentVersionExpirationDays)
    : undefined,
  transitions: (r.transitions ?? []).map(t => ({
    storageClass: mapStorageClass(t.storageClass),
    transitionAfter: Duration.days(t.transitionAfterDays),
  })),
  noncurrentVersionTransitions: (r.noncurrentVersionTransitions ?? []).map(t => ({
    storageClass: mapStorageClass(t.storageClass),
    transitionAfter: Duration.days(t.transitionAfterDays),
  })),
  abortIncompleteMultipartUploadAfter: r.abortIncompleteMultipartUploadAfterDays !== undefined
    ? Duration.days(r.abortIncompleteMultipartUploadAfterDays)
    : undefined,
});

export const mapCorsRule = (r: S3CorsRule): s3.CorsRule => ({
  allowedMethods: r.allowedMethods.map(m => m as s3.HttpMethods),
  allowedOrigins: r.allowedOrigins,
  allowedHeaders: r.allowedHeaders,
  exposedHeaders: r.exposedHeaders,
  maxAge: r.maxAge,
});

export const mapObjectLock = (props: S3BucketProps): s3.ObjectLockRetention | undefined => {
  if (!props.objectLockMode) return undefined;
  const days = props.objectLockRetentionDays ?? (props.objectLockRetentionYears
    ? props.objectLockRetentionYears * 365
    : undefined);
  if (days === undefined) return undefined;
  const duration = Duration.days(days);
  if (props.objectLockMode === 'COMPLIANCE') return s3.ObjectLockRetention.compliance(duration);
  return s3.ObjectLockRetention.governance(duration);
};

export const s3BucketProps = (ctx: Context, props: S3BucketProps): s3.BucketProps => ({
  bucketName: s3BucketName(ctx, props),
  versioned: props.mfaDeleteEnabled || (props.versioningEnabled ?? true),
  encryption: s3EncryptionConfig(props),
  bucketKeyEnabled: props.bucketKeyEnabled ?? false,
  blockPublicAccess: new s3.BlockPublicAccess({
    blockPublicAcls: props.blockPublicAcls ?? true,
    blockPublicPolicy: props.blockPublicPolicy ?? true,
    ignorePublicAcls: props.ignorePublicAcls ?? true,
    restrictPublicBuckets: props.restrictPublicBuckets ?? true,
  }),
  removalPolicy: (props.forceDestroy ?? false) ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
  autoDeleteObjects: props.forceDestroy ?? false,
  lifecycleRules: (props.lifecycleRules ?? []).map(mapLifecycleRule),
  cors: (props.corsRules ?? []).map(mapCorsRule),
  objectOwnership: mapObjectOwnership(props.objectOwnership ?? 'BucketOwnerEnforced'),
  transferAcceleration: props.transferAccelerationEnabled ?? false,
  serverAccessLogsPrefix: props.loggingPrefix,
  objectLockEnabled: !!props.objectLockMode,
  objectLockDefaultRetention: mapObjectLock(props),
});
