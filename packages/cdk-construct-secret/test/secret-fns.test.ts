import { makeContext } from '@sevenpico/cdk-context';
import { secretProps } from '../src/secret-fns';

describe('Secret pure functions', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'test', name: 'test' });

  test('stub test', () => {
    expect(secretProps(ctx, {})).toBeDefined();
  });
});
