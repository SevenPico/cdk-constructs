import { makeContext } from '@sevenpico/cdk-context';
import { cloudwatchEventsProps } from '../src/cloudwatch-events-fns';

describe('CloudwatchEvents pure functions', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'test', name: 'test' });

  test('stub test', () => {
    expect(cloudwatchEventsProps(ctx, {})).toBeDefined();
  });
});
