import { makeContext } from '@sevenpico/cdk-context';
import { ruleName, ruleProps } from '../src/cloudwatch-events-fns';
import { CloudwatchEventRule } from '../src/cloudwatch-events-types';

describe('CloudwatchEvents pure functions', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'monitor' });

  const baseRule: CloudwatchEventRule = {
    name: 'ec2-state',
    targets: [{ type: 'sns', arn: 'arn:aws:sns:us-east-1:123456789012:topic' }],
  };

  test('ruleName joins contextId and rule name', () => {
    expect(ruleName(ctx, baseRule)).toBe('7p-prod-monitor-ec2-state');
  });

  test('ruleProps includes schedule when provided', () => {
    const rule: CloudwatchEventRule = { ...baseRule, schedule: 'rate(5 minutes)' };
    const props = ruleProps(ctx, rule);
    expect(props.schedule).toBeDefined();
    expect(props.ruleName).toBe('7p-prod-monitor-ec2-state');
  });

  test('ruleProps includes eventPattern when provided', () => {
    const rule: CloudwatchEventRule = {
      ...baseRule,
      eventPattern: '{"source":["aws.ec2"]}',
    };
    const props = ruleProps(ctx, rule);
    expect(props.eventPattern).toEqual({ source: ['aws.ec2'] });
  });

  test('ruleProps has no schedule or eventPattern when neither provided', () => {
    const props = ruleProps(ctx, baseRule);
    expect(props.schedule).toBeUndefined();
    expect(props.eventPattern).toBeUndefined();
    expect(props.enabled).toBe(true);
  });

  test('ruleProps includes description when provided', () => {
    const rule: CloudwatchEventRule = { ...baseRule, description: 'Monitors EC2 state changes' };
    const props = ruleProps(ctx, rule);
    expect(props.description).toBe('Monitors EC2 state changes');
  });
});
