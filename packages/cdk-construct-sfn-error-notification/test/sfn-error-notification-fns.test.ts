import { makeContext } from '@sevenpico/cdk-context';
import { sfnErrorNotificationProps } from '../src/sfn-error-notification-fns';

describe('SfnErrorNotification pure functions', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'test', name: 'test' });

  test('stub test', () => {
    expect(sfnErrorNotificationProps(ctx, {})).toBeDefined();
  });
});
