import { makeContext } from '@sevenpico/cdk-context';
import { ruleName, targetId, eventbridgeRuleProps } from '../src/eventbridge-rule-fns';
import { EventbridgeRuleProps } from '../src/eventbridge-rule-types';

const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 's3events' });

const baseProps: EventbridgeRuleProps = {
  context: ctx,
  eventPattern: { source: ['aws.s3'] },
  targetArn: 'arn:aws:lambda:us-east-1:123456789012:function:my-fn',
};

describe('ruleName', () => {
  test('returns context ID', () => {
    expect(ruleName(ctx)).toBe('7p-prod-s3events');
  });
});

describe('targetId', () => {
  test('returns context ID with -target suffix by default', () => {
    expect(targetId(ctx, baseProps)).toBe('7p-prod-s3events-target');
  });

  test('returns custom target ID when provided', () => {
    expect(targetId(ctx, { ...baseProps, targetId: 'my-target' })).toBe('my-target');
  });
});

describe('eventbridgeRuleProps', () => {
  test('uses context ID as rule name', () => {
    expect(eventbridgeRuleProps(ctx, baseProps).ruleName).toBe('7p-prod-s3events');
  });

  test('rule enabled by default', () => {
    expect(eventbridgeRuleProps(ctx, baseProps).enabled).toBe(true);
  });

  test('rule can be disabled', () => {
    expect(eventbridgeRuleProps(ctx, { ...baseProps, ruleEnabled: false }).enabled).toBe(false);
  });

  test('passes description through', () => {
    expect(eventbridgeRuleProps(ctx, { ...baseProps, description: 'test desc' }).description).toBe('test desc');
  });

  test('passes event pattern through', () => {
    const props = eventbridgeRuleProps(ctx, baseProps);
    expect(props.eventPattern).toEqual({ source: ['aws.s3'] });
  });

  test('event bus is undefined when not provided', () => {
    expect(eventbridgeRuleProps(ctx, baseProps).eventBus).toBeUndefined();
  });
});
