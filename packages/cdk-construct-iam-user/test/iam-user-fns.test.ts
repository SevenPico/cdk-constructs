import { makeContext } from '@sevenpico/cdk-context';
import { iamUserProps } from '../src/iam-user-fns';

describe('IamUser pure functions', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'test', name: 'test' });

  test('stub test', () => {
    expect(iamUserProps(ctx, {})).toBeDefined();
  });
});
