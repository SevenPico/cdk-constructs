import { makeContext } from '@sevenpico/cdk-context';
import { eventbridgeRuleProps } from '../src/eventbridge-rule-fns';

describe('EventbridgeRule pure functions', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'test', name: 'test' });

  test('stub test', () => {
    expect(eventbridgeRuleProps(ctx, {})).toBeDefined();
  });
});
