import { makeContext } from '@sevenpico/cdk-context';
import { slackbotProps } from '../src/slackbot-fns';

describe('Slackbot pure functions', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'test', name: 'test' });

  test('stub test', () => {
    expect(slackbotProps(ctx, {})).toBeDefined();
  });
});
