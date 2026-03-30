import { makeContext } from '@sevenpico/cdk-context';
import { stepFunctionsProps } from '../src/step-functions-fns';

describe('StepFunctions pure functions', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'test', name: 'test' });

  test('stub test', () => {
    expect(stepFunctionsProps(ctx, {})).toBeDefined();
  });
});
