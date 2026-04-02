import {
  aws_events as events,
  aws_events_targets as targets,
  aws_sns as sns,
  aws_lambda as lambda,
  aws_sqs as sqs,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Context, contextId } from '@sevenpico/cdk-context';
import {
  CloudwatchEventRule,
  CloudwatchEventTarget,
} from './cloudwatch-events-types';

export const ruleName = (ctx: Context, rule: CloudwatchEventRule): string =>
  `${contextId(ctx)}-${rule.name}`;

export const ruleProps = (
  ctx: Context,
  rule: CloudwatchEventRule,
): events.RuleProps => {
  const props: events.RuleProps = {
    ruleName: ruleName(ctx, rule),
    description: rule.description,
    enabled: true,
  };

  if (rule.schedule) {
    return {
      ...props,
      schedule: events.Schedule.expression(rule.schedule),
    };
  }

  if (rule.eventPattern) {
    return {
      ...props,
      eventPattern: JSON.parse(rule.eventPattern) as events.EventPattern,
    };
  }

  return props;
};

export const buildTarget = (
  scope: Construct,
  targetId: string,
  targetCfg: CloudwatchEventTarget,
): events.IRuleTarget => {
  const inputMessage = targetCfg.inputTransformer
    ? events.RuleTargetInput.fromText(targetCfg.inputTransformer.inputTemplate)
    : undefined;

  switch (targetCfg.type) {
    case 'sns':
      return new targets.SnsTopic(
        sns.Topic.fromTopicArn(scope, `SnsTopic-${targetId}`, targetCfg.arn),
        inputMessage ? { message: inputMessage } : {},
      );
    case 'lambda':
      return new targets.LambdaFunction(
        lambda.Function.fromFunctionArn(scope, `LambdaFn-${targetId}`, targetCfg.arn),
        inputMessage ? { event: inputMessage } : {},
      );
    case 'sqs':
      return new targets.SqsQueue(
        sqs.Queue.fromQueueArn(scope, `SqsQueue-${targetId}`, targetCfg.arn),
        inputMessage ? { message: inputMessage } : {},
      );
    default:
      throw new Error(`Unsupported CloudwatchEventTarget type: ${targetCfg.type}`);
  }
};
