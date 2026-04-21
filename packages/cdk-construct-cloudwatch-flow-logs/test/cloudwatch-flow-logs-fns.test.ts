import { makeContext } from '@sevenpico/cdk-context';
import { aws_ec2 as ec2, RemovalPolicy } from 'aws-cdk-lib';
import {
  logGroupName,
  flowLogRoleName,
  flowLogsPolicyStatement,
  logGroupProps,
  mapTrafficType,
} from '../src/cloudwatch-flow-logs-fns';

describe('CloudwatchFlowLogs pure functions', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'network' });

  test('logGroupName returns /aws/vpc/flowlogs/{contextId}', () => {
    expect(logGroupName(ctx)).toBe('/aws/vpc/flowlogs/7p-prod-network');
  });

  test('flowLogRoleName returns {contextId}-flow-logs-role', () => {
    expect(flowLogRoleName(ctx)).toBe('7p-prod-network-flow-logs-role');
  });

  test('flowLogsPolicyStatement includes required CloudWatch Logs actions', () => {
    const stmt = flowLogsPolicyStatement();
    const json = stmt.toJSON();
    expect(json.Action).toEqual(expect.arrayContaining([
      'logs:CreateLogGroup',
      'logs:CreateLogStream',
      'logs:PutLogEvents',
      'logs:DescribeLogGroups',
      'logs:DescribeLogStreams',
    ]));
    expect(json.Effect).toBe('Allow');
    expect(json.Resource).toBe('*');
  });

  test('logGroupProps defaults retention to 365', () => {
    const result = logGroupProps(ctx, { context: ctx, vpcId: 'vpc-123' });
    expect(result.logGroupName).toBe('/aws/vpc/flowlogs/7p-prod-network');
    expect(result.retention).toBe(365);
    expect(result.removalPolicy).toBe(RemovalPolicy.DESTROY);
  });

  test('logGroupProps uses provided retention days', () => {
    const result = logGroupProps(ctx, { context: ctx, vpcId: 'vpc-123', cloudwatchLogRetentionDays: 90 });
    expect(result.retention).toBe(90);
  });

  test('mapTrafficType defaults to ALL', () => {
    expect(mapTrafficType()).toBe(ec2.FlowLogTrafficType.ALL);
    expect(mapTrafficType(undefined)).toBe(ec2.FlowLogTrafficType.ALL);
  });

  test('mapTrafficType maps ACCEPT', () => {
    expect(mapTrafficType('ACCEPT')).toBe(ec2.FlowLogTrafficType.ACCEPT);
  });

  test('mapTrafficType maps REJECT', () => {
    expect(mapTrafficType('REJECT')).toBe(ec2.FlowLogTrafficType.REJECT);
  });

  test('mapTrafficType falls back to ALL for unknown value', () => {
    expect(mapTrafficType('INVALID')).toBe(ec2.FlowLogTrafficType.ALL);
  });
});
