import { aws_cloudtrail as cloudtrail } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { trailName, logGroupName, mapReadWriteType, logGroupProps } from '../src/cloudtrail-fns';
import { CloudtrailProps } from '../src/cloudtrail-types';

describe('Cloudtrail pure functions', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'audit' });

  test('trailName returns context ID', () => {
    expect(trailName(ctx)).toBe('7p-prod-audit');
  });

  test('logGroupName returns /aws/cloudtrail/{contextId}', () => {
    expect(logGroupName(ctx)).toBe('/aws/cloudtrail/7p-prod-audit');
  });

  describe('mapReadWriteType', () => {
    test('defaults to ALL', () => {
      expect(mapReadWriteType()).toBe(cloudtrail.ReadWriteType.ALL);
    });
    test('maps ReadWrite to ALL', () => {
      expect(mapReadWriteType('ReadWrite')).toBe(cloudtrail.ReadWriteType.ALL);
    });
    test('maps Read to READ_ONLY', () => {
      expect(mapReadWriteType('Read')).toBe(cloudtrail.ReadWriteType.READ_ONLY);
    });
    test('maps Write to WRITE_ONLY', () => {
      expect(mapReadWriteType('Write')).toBe(cloudtrail.ReadWriteType.WRITE_ONLY);
    });
    test('maps None to NONE', () => {
      expect(mapReadWriteType('None')).toBe(cloudtrail.ReadWriteType.NONE);
    });
    test('unknown value defaults to ALL', () => {
      expect(mapReadWriteType('Invalid')).toBe(cloudtrail.ReadWriteType.ALL);
    });
  });

  describe('logGroupProps', () => {
    test('uses default retention of 90 days', () => {
      const props: CloudtrailProps = { context: ctx, s3BucketName: 'bucket' };
      const result = logGroupProps(ctx, props);
      expect(result.logGroupName).toBe('/aws/cloudtrail/7p-prod-audit');
      expect(result.retention).toBe(90);
    });

    test('uses custom retention when provided', () => {
      const props: CloudtrailProps = { context: ctx, s3BucketName: 'bucket', cloudWatchLogsRetentionDays: 30 };
      const result = logGroupProps(ctx, props);
      expect(result.retention).toBe(30);
    });
  });
});
