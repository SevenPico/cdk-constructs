import { makeContext } from '@sevenpico/cdk-context';
import { sesProps } from '../src/ses-fns';

describe('Ses pure functions', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'test', name: 'test' });

  test('stub test', () => {
    expect(sesProps(ctx, {})).toBeDefined();
  });
});
