import { makeContext } from '@sevenpico/cdk-context';
import { cloudtrailCloudwatchAlarmsProps } from '../src/cloudtrail-cloudwatch-alarms-fns';

describe('CloudtrailCloudwatchAlarms pure functions', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'test', name: 'test' });

  test('stub test', () => {
    expect(cloudtrailCloudwatchAlarmsProps(ctx, {})).toBeDefined();
  });
});
