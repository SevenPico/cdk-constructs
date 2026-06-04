import { makeContext } from '@sevenpico/cdk-context';
import { App, Stack } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { EventbridgeRule } from '../src/eventbridge-rule';
import { EventbridgeRuleProps } from '../src/eventbridge-rule-types';

const context = makeContext({ namespace: '7p', stage: 'prod', name: 's3events' });

const baseProps: EventbridgeRuleProps = {
  context,
  eventPattern: { source: ['aws.s3'] },
  targetArn: 'arn:aws:lambda:us-east-1:123456789012:function:my-fn',
};

const synthTemplate = (props: EventbridgeRuleProps): Template => {
  const app = new App();
  const stack = new Stack(app, 'TestStack');
  new EventbridgeRule(stack, 'SUT', props);
  return Template.fromStack(stack);
};

describe('EventbridgeRule construct', () => {
  describe('Rule Naming', () => {
    test('rule uses context ID as name', () => {
      const template = synthTemplate(baseProps);
      template.hasResourceProperties('AWS::Events::Rule', {
        Name: '7p-prod-s3events',
      });
    });
  });

  describe('Rule Configuration', () => {
    test('rule is enabled by default', () => {
      const template = synthTemplate(baseProps);
      template.hasResourceProperties('AWS::Events::Rule', {
        State: 'ENABLED',
      });
    });

    test('rule can be disabled via prop', () => {
      const template = synthTemplate({ ...baseProps, ruleEnabled: false });
      template.hasResourceProperties('AWS::Events::Rule', {
        State: 'DISABLED',
      });
    });

    test('event pattern is applied to the rule', () => {
      const template = synthTemplate(baseProps);
      template.hasResourceProperties('AWS::Events::Rule', {
        EventPattern: Match.objectLike({
          source: ['aws.s3'],
        }),
      });
    });

    test('description is applied when provided', () => {
      const template = synthTemplate({ ...baseProps, description: 'S3 event rule' });
      template.hasResourceProperties('AWS::Events::Rule', {
        Description: 'S3 event rule',
      });
    });
  });

  describe('Target', () => {
    test('target ID defaults to context ID + suffix', () => {
      const template = synthTemplate(baseProps);
      template.hasResourceProperties('AWS::Events::Rule', {
        Targets: Match.arrayWith([
          Match.objectLike({
            Id: '7p-prod-s3events-target',
            Arn: 'arn:aws:lambda:us-east-1:123456789012:function:my-fn',
          }),
        ]),
      });
    });

    test('custom target ID is used when provided', () => {
      const template = synthTemplate({ ...baseProps, targetId: 'my-target' });
      template.hasResourceProperties('AWS::Events::Rule', {
        Targets: Match.arrayWith([
          Match.objectLike({
            Id: 'my-target',
          }),
        ]),
      });
    });

    test('target role ARN is passed when provided', () => {
      const template = synthTemplate({
        ...baseProps,
        targetRoleArn: 'arn:aws:iam::123456789012:role/my-role',
      });
      template.hasResourceProperties('AWS::Events::Rule', {
        Targets: Match.arrayWith([
          Match.objectLike({
            RoleArn: 'arn:aws:iam::123456789012:role/my-role',
          }),
        ]),
      });
    });

    test('cross-bus target uses EventBus target', () => {
      const template = synthTemplate({
        ...baseProps,
        targetEventBusArn: 'arn:aws:events:us-east-1:123456789012:event-bus/target-bus',
      });
      template.hasResourceProperties('AWS::Events::Rule', {
        Targets: Match.arrayWith([
          Match.objectLike({
            Arn: 'arn:aws:events:us-east-1:123456789012:event-bus/target-bus',
          }),
        ]),
      });
    });
  });

  describe('Source Event Bus', () => {
    test('no event bus ref by default (uses default bus)', () => {
      const template = synthTemplate(baseProps);
      template.hasResourceProperties('AWS::Events::Rule', {
        EventBusName: Match.absent(),
      });
    });

    test('source event bus name is applied when provided', () => {
      const template = synthTemplate({ ...baseProps, sourceEventBusName: 'my-custom-bus' });
      template.hasResourceProperties('AWS::Events::Rule', {
        EventBusName: 'my-custom-bus',
      });
    });
  });

  describe('Disabled Construct', () => {
    test('no resources created when context is disabled', () => {
      const disabledCtx = makeContext({
        namespace: '7p', stage: 'prod', name: 's3events', enabled: false,
      });
      const template = synthTemplate({ ...baseProps, context: disabledCtx });
      expect(Object.keys(template.toJSON().Resources ?? {})).toHaveLength(0);
    });
  });
});
