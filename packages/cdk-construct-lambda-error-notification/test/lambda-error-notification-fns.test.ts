import { makeContext } from '@sevenpico/cdk-context';
import { lambdaErrorNotificationProps } from '../src/lambda-error-notification-fns';

describe('LambdaErrorNotification pure functions', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'test', name: 'test' });

  test('stub test', () => {
    expect(lambdaErrorNotificationProps(ctx, {})).toBeDefined();
  });
});
