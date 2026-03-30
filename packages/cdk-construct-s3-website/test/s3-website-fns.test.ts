import { makeContext } from '@sevenpico/cdk-context';
import { s3WebsiteProps } from '../src/s3-website-fns';

describe('S3Website pure functions', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'test', name: 'test' });

  test('stub test', () => {
    expect(s3WebsiteProps(ctx, {})).toBeDefined();
  });
});
