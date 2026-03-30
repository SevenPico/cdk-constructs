import { makeContext } from '@sevenpico/cdk-context';
import { expressSfnErrorNotificationProps } from '../src/express-sfn-error-notification-fns';

describe('ExpressSfnErrorNotification pure functions', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'test', name: 'test' });

  test('stub test', () => {
    expect(expressSfnErrorNotificationProps(ctx, {})).toBeDefined();
  });
});
