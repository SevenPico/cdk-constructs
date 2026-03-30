import { makeContext } from '@sevenpico/cdk-context';
import { snsProps } from '../src/sns-fns';

describe('Sns pure functions', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'test', name: 'test' });

  test('stub test', () => {
    expect(snsProps(ctx, {})).toBeDefined();
  });
});
