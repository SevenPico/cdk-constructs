import { makeContext } from '@sevenpico/cdk-context';
import { iamPolicyProps } from '../src/iam-policy-fns';

describe('IamPolicy pure functions', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'test', name: 'test' });

  test('stub test', () => {
    expect(iamPolicyProps(ctx, {})).toBeDefined();
  });
});
