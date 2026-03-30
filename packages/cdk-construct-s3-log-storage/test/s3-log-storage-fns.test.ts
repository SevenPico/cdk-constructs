import { makeContext } from '@sevenpico/cdk-context';
import { s3LogStorageProps } from '../src/s3-log-storage-fns';

describe('S3LogStorage pure functions', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'test', name: 'test' });

  test('stub test', () => {
    expect(s3LogStorageProps(ctx, {})).toBeDefined();
  });
});
