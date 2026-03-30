import { makeContext } from '@sevenpico/cdk-context';
import { cloudwatchFlowLogsProps } from '../src/cloudwatch-flow-logs-fns';

describe('CloudwatchFlowLogs pure functions', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'test', name: 'test' });

  test('stub test', () => {
    expect(cloudwatchFlowLogsProps(ctx, {})).toBeDefined();
  });
});
