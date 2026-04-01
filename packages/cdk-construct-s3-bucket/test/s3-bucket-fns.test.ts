import { makeContext } from '@sevenpico/cdk-context';
import {
  s3BucketProps, s3BucketName, s3EncryptionConfig, mapObjectOwnership,
  mapLifecycleRule, mapCorsRule, mapObjectLock, mapStorageClass,
} from '../src/s3-bucket-fns';
import { aws_s3 as s3, RemovalPolicy, Duration } from 'aws-cdk-lib';

describe('s3BucketName', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'assets' });

  test('defaults to context id', () => {
    expect(s3BucketName(ctx, { context: ctx })).toBe('7p-prod-assets');
  });

  test('custom name overrides default', () => {
    expect(s3BucketName(ctx, { context: ctx, bucketName: 'custom-bucket' })).toBe('custom-bucket');
  });
});

describe('s3EncryptionConfig', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'assets' });

  test('defaults to S3_MANAGED', () => {
    expect(s3EncryptionConfig({ context: ctx })).toBe(s3.BucketEncryption.S3_MANAGED);
  });

  test('returns KMS when sseAlgorithm is aws:kms', () => {
    expect(s3EncryptionConfig({ context: ctx, sseAlgorithm: 'aws:kms' })).toBe(s3.BucketEncryption.KMS);
  });

  test('returns KMS when kmsKeyArn provided', () => {
    expect(s3EncryptionConfig({ context: ctx, kmsKeyArn: 'arn:aws:kms:us-east-1:123:key/test' })).toBe(s3.BucketEncryption.KMS);
  });
});

describe('mapObjectOwnership', () => {
  test('maps BucketOwnerEnforced', () => {
    expect(mapObjectOwnership('BucketOwnerEnforced')).toBe(s3.ObjectOwnership.BUCKET_OWNER_ENFORCED);
  });

  test('maps BucketOwnerPreferred', () => {
    expect(mapObjectOwnership('BucketOwnerPreferred')).toBe(s3.ObjectOwnership.BUCKET_OWNER_PREFERRED);
  });

  test('maps ObjectWriter', () => {
    expect(mapObjectOwnership('ObjectWriter')).toBe(s3.ObjectOwnership.OBJECT_WRITER);
  });

  test('defaults to BucketOwnerEnforced for unknown', () => {
    expect(mapObjectOwnership('unknown')).toBe(s3.ObjectOwnership.BUCKET_OWNER_ENFORCED);
  });
});

describe('mapStorageClass', () => {
  test('maps GLACIER', () => {
    expect(mapStorageClass('GLACIER')).toBe(s3.StorageClass.GLACIER);
  });

  test('maps STANDARD_IA', () => {
    expect(mapStorageClass('STANDARD_IA')).toBe(s3.StorageClass.INFREQUENT_ACCESS);
  });

  test('maps DEEP_ARCHIVE', () => {
    expect(mapStorageClass('DEEP_ARCHIVE')).toBe(s3.StorageClass.DEEP_ARCHIVE);
  });

  test('maps INTELLIGENT_TIERING', () => {
    expect(mapStorageClass('INTELLIGENT_TIERING')).toBe(s3.StorageClass.INTELLIGENT_TIERING);
  });

  test('creates custom StorageClass for unknown value', () => {
    const result = mapStorageClass('CUSTOM_CLASS');
    expect(result).toBeInstanceOf(s3.StorageClass);
  });
});

describe('mapLifecycleRule', () => {
  test('maps basic lifecycle rule with defaults', () => {
    const result = mapLifecycleRule({ id: 'test-rule' });
    expect(result.id).toBe('test-rule');
    expect(result.enabled).toBe(true);
    expect(result.transitions).toEqual([]);
    expect(result.noncurrentVersionTransitions).toEqual([]);
  });

  test('maps expiration days', () => {
    const result = mapLifecycleRule({ expirationDays: 90 });
    expect(result.expiration).toEqual(Duration.days(90));
  });

  test('maps noncurrent version expiration', () => {
    const result = mapLifecycleRule({ noncurrentVersionExpirationDays: 30 });
    expect(result.noncurrentVersionExpiration).toEqual(Duration.days(30));
  });

  test('maps transitions with storage class', () => {
    const result = mapLifecycleRule({
      transitions: [{ storageClass: 'GLACIER', transitionAfterDays: 90 }],
    });
    expect(result.transitions).toHaveLength(1);
    expect(result.transitions![0].storageClass).toBe(s3.StorageClass.GLACIER);
    expect(result.transitions![0].transitionAfter).toEqual(Duration.days(90));
  });

  test('maps noncurrent version transitions', () => {
    const result = mapLifecycleRule({
      noncurrentVersionTransitions: [{ storageClass: 'DEEP_ARCHIVE', transitionAfterDays: 180 }],
    });
    expect(result.noncurrentVersionTransitions).toHaveLength(1);
    expect(result.noncurrentVersionTransitions![0].storageClass).toBe(s3.StorageClass.DEEP_ARCHIVE);
  });

  test('maps abort incomplete multipart upload', () => {
    const result = mapLifecycleRule({ abortIncompleteMultipartUploadAfterDays: 7 });
    expect(result.abortIncompleteMultipartUploadAfter).toEqual(Duration.days(7));
  });

  test('maps prefix and enabled false', () => {
    const result = mapLifecycleRule({ prefix: 'logs/', enabled: false });
    expect(result.prefix).toBe('logs/');
    expect(result.enabled).toBe(false);
  });
});

describe('mapCorsRule', () => {
  test('maps required fields', () => {
    const result = mapCorsRule({
      allowedMethods: ['GET', 'PUT'],
      allowedOrigins: ['https://example.com'],
    });
    expect(result.allowedMethods).toEqual(['GET', 'PUT']);
    expect(result.allowedOrigins).toEqual(['https://example.com']);
  });

  test('maps optional fields', () => {
    const result = mapCorsRule({
      allowedMethods: ['GET'],
      allowedOrigins: ['*'],
      allowedHeaders: ['Content-Type'],
      exposedHeaders: ['x-amz-request-id'],
      maxAge: 3600,
    });
    expect(result.allowedHeaders).toEqual(['Content-Type']);
    expect(result.exposedHeaders).toEqual(['x-amz-request-id']);
    expect(result.maxAge).toBe(3600);
  });
});

describe('mapObjectLock', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'assets' });

  test('returns undefined when no objectLockMode', () => {
    expect(mapObjectLock({ context: ctx })).toBeUndefined();
  });

  test('returns undefined when mode set but no retention period', () => {
    expect(mapObjectLock({ context: ctx, objectLockMode: 'GOVERNANCE' })).toBeUndefined();
  });

  test('returns retention for COMPLIANCE mode with days', () => {
    const result = mapObjectLock({ context: ctx, objectLockMode: 'COMPLIANCE', objectLockRetentionDays: 30 });
    expect(result).toBeDefined();
  });

  test('returns retention for GOVERNANCE mode with days', () => {
    const result = mapObjectLock({ context: ctx, objectLockMode: 'GOVERNANCE', objectLockRetentionDays: 90 });
    expect(result).toBeDefined();
  });

  test('converts years to days', () => {
    const result = mapObjectLock({ context: ctx, objectLockMode: 'COMPLIANCE', objectLockRetentionYears: 1 });
    expect(result).toBeDefined();
  });
});

describe('s3BucketProps', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'assets' });

  test('sets bucket name from context', () => {
    const props = s3BucketProps(ctx, { context: ctx });
    expect(props.bucketName).toBe('7p-prod-assets');
  });

  test('sets versioning to true by default', () => {
    const props = s3BucketProps(ctx, { context: ctx });
    expect(props.versioned).toBe(true);
  });

  test('versioning can be disabled', () => {
    const props = s3BucketProps(ctx, { context: ctx, versioningEnabled: false });
    expect(props.versioned).toBe(false);
  });

  test('sets all public access blocks to true by default', () => {
    const props = s3BucketProps(ctx, { context: ctx });
    const block = props.blockPublicAccess as any;
    expect(block.blockPublicAcls).toBe(true);
    expect(block.blockPublicPolicy).toBe(true);
    expect(block.ignorePublicAcls).toBe(true);
    expect(block.restrictPublicBuckets).toBe(true);
  });

  test('defaults to RETAIN removal policy', () => {
    const props = s3BucketProps(ctx, { context: ctx });
    expect(props.removalPolicy).toBe(RemovalPolicy.RETAIN);
    expect(props.autoDeleteObjects).toBe(false);
  });

  test('sets DESTROY removal policy when forceDestroy is true', () => {
    const props = s3BucketProps(ctx, { context: ctx, forceDestroy: true });
    expect(props.removalPolicy).toBe(RemovalPolicy.DESTROY);
    expect(props.autoDeleteObjects).toBe(true);
  });

  test('defaults bucketKeyEnabled to false', () => {
    const props = s3BucketProps(ctx, { context: ctx });
    expect(props.bucketKeyEnabled).toBe(false);
  });

  test('defaults transferAcceleration to false', () => {
    const props = s3BucketProps(ctx, { context: ctx });
    expect(props.transferAcceleration).toBe(false);
  });

  test('sets objectOwnership to BucketOwnerEnforced by default', () => {
    const props = s3BucketProps(ctx, { context: ctx });
    expect(props.objectOwnership).toBe(s3.ObjectOwnership.BUCKET_OWNER_ENFORCED);
  });

  test('maps lifecycle rules', () => {
    const props = s3BucketProps(ctx, { context: ctx, lifecycleRules: [{ id: 'rule1', expirationDays: 30 }] });
    expect(props.lifecycleRules).toHaveLength(1);
    expect(props.lifecycleRules![0].id).toBe('rule1');
  });

  test('maps cors rules', () => {
    const props = s3BucketProps(ctx, { context: ctx, corsRules: [{ allowedMethods: ['GET'], allowedOrigins: ['*'] }] });
    expect(props.cors).toHaveLength(1);
    expect(props.cors![0].allowedOrigins).toEqual(['*']);
  });

  test('enables object lock when objectLockMode set', () => {
    const props = s3BucketProps(ctx, { context: ctx, objectLockMode: 'GOVERNANCE', objectLockRetentionDays: 30 });
    expect(props.objectLockEnabled).toBe(true);
    expect(props.objectLockDefaultRetention).toBeDefined();
  });

  test('defaults encryption to S3_MANAGED', () => {
    const props = s3BucketProps(ctx, { context: ctx });
    expect(props.encryption).toBe(s3.BucketEncryption.S3_MANAGED);
  });
});
