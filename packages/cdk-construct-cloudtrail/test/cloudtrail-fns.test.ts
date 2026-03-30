import { makeContext } from '@sevenpico/cdk-context';
import { cloudtrailProps } from '../src/cloudtrail-fns';

describe('Cloudtrail pure functions', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'test', name: 'test' });

  test('stub test', () => {
    expect(cloudtrailProps(ctx, {})).toBeDefined();
  });
});
