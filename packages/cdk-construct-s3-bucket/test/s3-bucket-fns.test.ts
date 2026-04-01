import { makeContext } from '@sevenpico/cdk-context';
import { s3BucketProps, s3BucketName, s3EncryptionConfig, mapObjectOwnership } from '../src/s3-bucket-fns';
import { aws_s3 as s3 } from 'aws-cdk-lib';

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

  test('defaults to BucketOwnerEnforced for unknown', () => {
    expect(mapObjectOwnership('unknown')).toBe(s3.ObjectOwnership.BUCKET_OWNER_ENFORCED);
  });
});

describe('s3BucketProps', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'assets' });

  test('sets versioning to true by default', () => {
    const props = s3BucketProps(ctx, { context: ctx });
    expect(props.versioned).toBe(true);
  });

  test('sets all public access blocks to true by default', () => {
    const props = s3BucketProps(ctx, { context: ctx });
    const block = props.blockPublicAccess as s3.BlockPublicAccess;
    expect(block).toBeDefined();
  });
});
