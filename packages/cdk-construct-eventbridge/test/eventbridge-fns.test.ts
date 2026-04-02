import { makeContext } from '@sevenpico/cdk-context';
import { eventBusName, eventBusProps } from '../src/eventbridge-fns';
import { EventbridgeProps } from '../src/eventbridge-types';

const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'platform' });

const baseProps: EventbridgeProps = { context: ctx };

describe('eventBusName', () => {
  test('returns context ID by default', () => {
    expect(eventBusName(ctx, baseProps)).toBe('7p-prod-platform');
  });

  test('returns custom name when provided', () => {
    expect(eventBusName(ctx, { ...baseProps, eventBusName: 'my-bus' })).toBe('my-bus');
  });
});

describe('eventBusProps', () => {
  test('uses context ID as event bus name', () => {
    expect(eventBusProps(ctx, baseProps).eventBusName).toBe('7p-prod-platform');
  });

  test('does not include eventSourceName when not provided', () => {
    const props = eventBusProps(ctx, baseProps);
    expect(props.eventSourceName).toBeUndefined();
  });

  test('includes eventSourceName when provided', () => {
    const props = eventBusProps(ctx, { ...baseProps, eventSourceName: 'aws.partner/example.com' });
    expect(props.eventSourceName).toBe('aws.partner/example.com');
  });
});
