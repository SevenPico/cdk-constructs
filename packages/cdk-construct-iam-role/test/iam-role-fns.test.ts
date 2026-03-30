import { makeContext } from '@sevenpico/cdk-context';
import { iamRoleProps } from '../src/iam-role-fns';

describe('IamRole pure functions', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'test', name: 'test' });

  test('stub test', () => {
    expect(iamRoleProps(ctx, {})).toBeDefined();
  });
});
