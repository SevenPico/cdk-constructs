import { makeContext } from '@sevenpico/cdk-context';
import { lambdaFunctionProps } from '../src/lambda-function-fns';

describe('LambdaFunction pure functions', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'test', name: 'test' });

  test('stub test', () => {
    expect(lambdaFunctionProps(ctx, {})).toBeDefined();
  });
});
