import { App, Stack } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { makeContext, Context } from '@sevenpico/cdk-context';
import { loadFeature, defineFeature } from 'jest-cucumber';
import path from 'path';
import { CloudwatchEvents } from '../src/cloudwatch-events';
import { CloudwatchEventRule } from '../src/cloudwatch-events-types';

const feature = loadFeature(path.join(__dirname, 'cloudwatch-events.feature'));

const makeStack = (): Stack => {
  const app = new App();
  return new Stack(app, 'TestStack');
};

const defaultSnsTarget = {
  type: 'sns',
  arn: 'arn:aws:sns:us-east-1:123456789012:my-topic',
};

const defaultEventPattern = '{"source":["aws.ec2"],"detail-type":["EC2 Instance State-change Notification"]}';

defineFeature(feature, (test: any) => {
  let context: Context;
  let stack: Stack;
  let template: Template;
  let rules: CloudwatchEventRule[];

  test('Rule created with context-derived name', ({ given, and, when, then }: any) => {
    given(/^a context with namespace "(.+)", stage "(.+)", name "(.+)"$/, (ns: string, stage: string, name: string) => {
      context = makeContext({ namespace: ns, stage, name });
      rules = [];
    });
    and(/^a rule with name "(.+)"$/, (name: string) => {
      rules = [{ name, eventPattern: defaultEventPattern, targets: [defaultSnsTarget] }];
    });
    when('a CloudwatchEvents construct is created', () => {
      stack = makeStack();
      new CloudwatchEvents(stack, 'SUT', { context, rules });
      template = Template.fromStack(stack);
    });
    then(/^an AWS::Events::Rule resource exists with Name "(.+)"$/, (ruleName: string) => {
      template.hasResourceProperties('AWS::Events::Rule', {
        Name: ruleName,
      });
    });
  });

  test('Scheduled rule created from rate expression', ({ given, and, when, then }: any) => {
    given('a default context', () => {
      context = makeContext({ namespace: '7p', stage: 'prod', name: 'monitor' });
      rules = [];
    });
    and(/^a rule with schedule "(.+)"$/, (schedule: string) => {
      rules = [{ name: 'scheduled', schedule, targets: [defaultSnsTarget] }];
    });
    when('a CloudwatchEvents construct is created', () => {
      stack = makeStack();
      new CloudwatchEvents(stack, 'SUT', { context, rules });
      template = Template.fromStack(stack);
    });
    then(/^the AWS::Events::Rule has ScheduleExpression "(.+)"$/, (expr: string) => {
      template.hasResourceProperties('AWS::Events::Rule', {
        ScheduleExpression: expr,
      });
    });
  });

  test('SNS target added to rule when type is sns', ({ given, and, when, then }: any) => {
    given('a default context', () => {
      context = makeContext({ namespace: '7p', stage: 'prod', name: 'monitor' });
      rules = [];
    });
    and(/^a rule with an SNS target "(.+)"$/, (arn: string) => {
      rules = [{ name: 'sns-rule', eventPattern: defaultEventPattern, targets: [{ type: 'sns', arn }] }];
    });
    when('a CloudwatchEvents construct is created', () => {
      stack = makeStack();
      new CloudwatchEvents(stack, 'SUT', { context, rules });
      template = Template.fromStack(stack);
    });
    then('the rule targets contain an entry with Arn referencing the SNS topic', () => {
      template.hasResourceProperties('AWS::Events::Rule', {
        Targets: Match.arrayWith([
          Match.objectLike({
            Arn: 'arn:aws:sns:us-east-1:123456789012:my-topic',
          }),
        ]),
      });
    });
  });

  test('Lambda target added to rule when type is lambda', ({ given, and, when, then }: any) => {
    given('a default context', () => {
      context = makeContext({ namespace: '7p', stage: 'prod', name: 'monitor' });
      rules = [];
    });
    and(/^a rule with a Lambda target "(.+)"$/, (arn: string) => {
      rules = [{ name: 'lambda-rule', eventPattern: defaultEventPattern, targets: [{ type: 'lambda', arn }] }];
    });
    when('a CloudwatchEvents construct is created', () => {
      stack = makeStack();
      new CloudwatchEvents(stack, 'SUT', { context, rules });
      template = Template.fromStack(stack);
    });
    then('the rule targets contain an entry referencing the Lambda function', () => {
      template.hasResourceProperties('AWS::Events::Rule', {
        Targets: Match.arrayWith([
          Match.objectLike({
            Arn: 'arn:aws:lambda:us-east-1:123456789012:function:my-fn',
          }),
        ]),
      });
    });
  });

  test('Multiple rules created when multiple rule configs provided', ({ given, and, when, then }: any) => {
    given('a default context', () => {
      context = makeContext({ namespace: '7p', stage: 'prod', name: 'monitor' });
      rules = [];
    });
    and('two rule configs', () => {
      rules = [
        { name: 'rule-one', eventPattern: defaultEventPattern, targets: [defaultSnsTarget] },
        { name: 'rule-two', schedule: 'rate(5 minutes)', targets: [defaultSnsTarget] },
      ];
    });
    when('a CloudwatchEvents construct is created', () => {
      stack = makeStack();
      new CloudwatchEvents(stack, 'SUT', { context, rules });
      template = Template.fromStack(stack);
    });
    then('two AWS::Events::Rule resources exist in the stack', () => {
      template.resourceCountIs('AWS::Events::Rule', 2);
    });
  });

  test('No resources created when context is disabled', ({ given, and, when, then }: any) => {
    given('a context with enabled false', () => {
      context = makeContext({ namespace: '7p', stage: 'test', name: 'test', enabled: false });
      rules = [];
    });
    and(/^a rule with name "(.+)"$/, (name: string) => {
      rules = [{ name, targets: [defaultSnsTarget] }];
    });
    when('a CloudwatchEvents construct is created', () => {
      stack = makeStack();
      new CloudwatchEvents(stack, 'SUT', { context, rules });
      template = Template.fromStack(stack);
    });
    then('no AWS::Events::Rule resources exist in the stack', () => {
      template.resourceCountIs('AWS::Events::Rule', 0);
    });
  });
});
