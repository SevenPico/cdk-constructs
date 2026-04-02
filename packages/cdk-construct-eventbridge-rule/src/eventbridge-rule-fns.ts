import { aws_events as events } from 'aws-cdk-lib';
import { Context, contextId } from '@sevenpico/cdk-context';
import { EventbridgeRuleProps } from './eventbridge-rule-types';

export const ruleName = (ctx: Context): string => contextId(ctx);

export const targetId = (ctx: Context, props: EventbridgeRuleProps): string =>
  props.targetId ?? `${contextId(ctx)}-target`;

export const eventbridgeRuleProps = (
  ctx: Context,
  props: EventbridgeRuleProps,
  eventBus?: events.IEventBus,
): events.RuleProps => ({
  ruleName: ruleName(ctx),
  description: props.description,
  enabled: props.ruleEnabled ?? true,
  eventBus,
  eventPattern: props.eventPattern as events.EventPattern,
});
