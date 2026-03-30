import { makeContext } from '@sevenpico/cdk-context';
import { eventbridgeProps } from '../src/eventbridge-fns';

describe('Eventbridge pure functions', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'test', name: 'test' });

  test('stub test', () => {
    expect(eventbridgeProps(ctx, {})).toBeDefined();
  });
});
