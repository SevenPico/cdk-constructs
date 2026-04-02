import { makeContext } from '@sevenpico/cdk-context';
import {
  machineDlqContext,
  machinePipeName,
  machineRateAlarmName,
  machineVolumeAlarmName,
} from '../src/express-sfn-error-notification-fns';

const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'monitor' });

describe('ExpressSfnErrorNotification pure functions', () => {
  test('machineDlqContext appends machine key and dlq', () => {
    const dCtx = machineDlqContext(ctx, 'orders');
    expect(dCtx.attributes).toContain('orders');
    expect(dCtx.attributes).toContain('dlq');
  });

  test('machinePipeName includes machine key', () => {
    expect(machinePipeName(ctx, 'orders')).toBe('7p-prod-monitor-orders-pipe');
  });

  test('machineRateAlarmName includes machine key', () => {
    expect(machineRateAlarmName(ctx, 'orders', { arn: 'test' })).toBe('7p-prod-monitor-orders-dlq-rate');
  });

  test('machineRateAlarmName uses override', () => {
    expect(machineRateAlarmName(ctx, 'orders', { arn: 'test', rateAlarmName: 'custom' })).toBe('custom');
  });

  test('machineVolumeAlarmName includes machine key', () => {
    expect(machineVolumeAlarmName(ctx, 'orders', { arn: 'test' })).toBe('7p-prod-monitor-orders-dlq-volume');
  });
});
