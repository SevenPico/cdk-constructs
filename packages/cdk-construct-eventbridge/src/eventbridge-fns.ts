import { aws_events as events } from 'aws-cdk-lib';
import { Context, contextId } from '@sevenpico/cdk-context';
import { EventbridgeProps } from './eventbridge-types';

export const eventBusName = (ctx: Context, props: EventbridgeProps): string =>
  props.eventBusName ?? contextId(ctx);

export const eventBusProps = (ctx: Context, props: EventbridgeProps): events.EventBusProps => ({
  eventBusName: eventBusName(ctx, props),
  ...(props.eventSourceName ? { eventSourceName: props.eventSourceName } : {}),
});
