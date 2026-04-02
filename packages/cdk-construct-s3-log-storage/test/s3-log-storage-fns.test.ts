import { makeContext } from '@sevenpico/cdk-context';
import { toS3BucketProps } from '../src/s3-log-storage-fns';
import { S3LogStorageProps } from '../src/s3-log-storage-types';

const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'logs' });

const baseProps: S3LogStorageProps = { context: ctx };

describe('S3LogStorage pure functions', () => {
  test('toS3BucketProps passes context through', () => {
    const result = toS3BucketProps(ctx, baseProps);
    expect(result.context).toBe(ctx);
  });

  test('toS3BucketProps defaults versioningEnabled to true', () => {
    const result = toS3BucketProps(ctx, baseProps);
    expect(result.versioningEnabled).toBe(true);
  });

  test('toS3BucketProps defaults sseAlgorithm to AES256', () => {
    const result = toS3BucketProps(ctx, baseProps);
    expect(result.sseAlgorithm).toBe('AES256');
  });

  test('toS3BucketProps defaults objectOwnership to ObjectWriter', () => {
    const result = toS3BucketProps(ctx, baseProps);
    expect(result.objectOwnership).toBe('ObjectWriter');
  });

  test('toS3BucketProps defaults allowSslRequestsOnly to true', () => {
    const result = toS3BucketProps(ctx, baseProps);
    expect(result.allowSslRequestsOnly).toBe(true);
  });

  test('toS3BucketProps defaults forceDestroy to false', () => {
    const result = toS3BucketProps(ctx, baseProps);
    expect(result.forceDestroy).toBe(false);
  });

  test('toS3BucketProps maps accessLogBucketName to loggingBucketName', () => {
    const result = toS3BucketProps(ctx, { ...baseProps, accessLogBucketName: 'my-log-bucket' });
    expect(result.loggingBucketName).toBe('my-log-bucket');
  });

  test('toS3BucketProps maps accessLogPrefix to loggingPrefix', () => {
    const result = toS3BucketProps(ctx, { ...baseProps, accessLogPrefix: 'logs/' });
    expect(result.loggingPrefix).toBe('logs/');
  });

  test('toS3BucketProps passes bucketName override', () => {
    const result = toS3BucketProps(ctx, { ...baseProps, bucketName: 'custom-bucket' });
    expect(result.bucketName).toBe('custom-bucket');
  });
});
