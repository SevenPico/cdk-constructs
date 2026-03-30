import { makeContext } from '@sevenpico/cdk-context';
import { s3BucketProps } from '../src/s3-bucket-fns';

describe('S3Bucket pure functions', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'test', name: 'test' });

  test('stub test', () => {
    expect(s3BucketProps(ctx, {})).toBeDefined();
  });
});
