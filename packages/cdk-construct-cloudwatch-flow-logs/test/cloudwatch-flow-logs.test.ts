import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { makeContext } from '@sevenpico/cdk-context';
import { CloudwatchFlowLogs } from '../src/cloudwatch-flow-logs';

describe('CloudwatchFlowLogs construct', () => {
  const context = makeContext({ namespace: '7p', stage: 'test', name: 'test' });

  test('creates no resources when disabled', () => {
    const app = new App();
    const stack = new Stack(app, 'Test');
    new CloudwatchFlowLogs(stack, 'SUT', {
      context: makeContext({ namespace: '7p', stage: 'test', name: 'test', enabled: false }),
    });
    // When disabled, no resources created
    expect(Object.keys(Template.fromStack(stack).toJSON().Resources ?? {})).toHaveLength(0);
  });

  test('stub test when enabled', () => {
    const app = new App();
    const stack = new Stack(app, 'Test');
    new CloudwatchFlowLogs(stack, 'SUT', { context });
    // TODO: add resource assertions
    expect(Template.fromStack(stack)).toBeDefined();
  });
});
