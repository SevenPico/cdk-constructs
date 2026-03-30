import { makeContext } from '@sevenpico/cdk-context';
import { kmsKeyProps } from '../src/kms-key-fns';

describe('KmsKey pure functions', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'test', name: 'test' });

  test('stub test', () => {
    expect(kmsKeyProps(ctx, {})).toBeDefined();
  });
});
