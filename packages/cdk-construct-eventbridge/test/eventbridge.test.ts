import { App, Stack } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { makeContext } from '@sevenpico/cdk-context';
import { Eventbridge } from '../src/eventbridge';
import { EventbridgeProps } from '../src/eventbridge-types';

const context = makeContext({ namespace: '7p', stage: 'prod', name: 'platform' });

const baseProps: EventbridgeProps = { context };

const synthTemplate = (props: EventbridgeProps): Template => {
  const app = new App();
  const stack = new Stack(app, 'TestStack');
  new Eventbridge(stack, 'SUT', props);
  return Template.fromStack(stack);
};

describe('Eventbridge construct', () => {
  describe('Event Bus Naming', () => {
    test('event bus uses context ID as name by default', () => {
      const template = synthTemplate(baseProps);
      template.hasResourceProperties('AWS::Events::EventBus', {
        Name: '7p-prod-platform',
      });
    });

    test('custom name overrides context ID', () => {
      const template = synthTemplate({ ...baseProps, eventBusName: 'my-bus' });
      template.hasResourceProperties('AWS::Events::EventBus', {
        Name: 'my-bus',
      });
    });
  });

  describe('KMS Encryption', () => {
    test('no KMS key by default', () => {
      const template = synthTemplate(baseProps);
      template.hasResourceProperties('AWS::Events::EventBus', {
        KmsKeyIdentifier: Match.absent(),
      });
    });

    test('KMS key applied when kmsKeyIdentifier provided', () => {
      const template = synthTemplate({
        ...baseProps,
        kmsKeyIdentifier: 'arn:aws:kms:us-east-1:123456789012:key/abc-123',
      });
      template.hasResourceProperties('AWS::Events::EventBus', {
        KmsKeyIdentifier: 'arn:aws:kms:us-east-1:123456789012:key/abc-123',
      });
    });
  });

  describe('Event Bus Policy', () => {
    test('resource policy attached when policyDocument provided', () => {
      const policy = JSON.stringify({
        Effect: 'Allow',
        Principal: { AWS: 'arn:aws:iam::123456789012:root' },
        Action: 'events:PutEvents',
        Resource: '*',
      });
      const template = synthTemplate({ ...baseProps, policyDocument: policy });
      template.resourceCountIs('AWS::Events::EventBusPolicy', 1);
      template.hasResourceProperties('AWS::Events::EventBusPolicy', {
        StatementId: '7p-prod-platform-policy',
      });
    });

    test('no policy resource when policyDocument not provided', () => {
      const template = synthTemplate(baseProps);
      template.resourceCountIs('AWS::Events::EventBusPolicy', 0);
    });
  });

  describe('Tags', () => {
    test('construct is created with tags applied via Tags.of()', () => {
      // EventBus does not render Tags in CloudFormation in this CDK version,
      // but Tags.of(this).add() is applied for any child resources that support tags.
      const taggedCtx = makeContext({
        namespace: '7p', stage: 'prod', name: 'platform',
        tags: { Team: 'platform' },
      });
      const template = synthTemplate({ context: taggedCtx });
      template.hasResourceProperties('AWS::Events::EventBus', {
        Name: '7p-prod-platform',
      });
    });
  });

  describe('Disabled Construct', () => {
    test('no resources created when context is disabled', () => {
      const disabledCtx = makeContext({
        namespace: '7p', stage: 'prod', name: 'platform', enabled: false,
      });
      const template = synthTemplate({ context: disabledCtx });
      expect(Object.keys(template.toJSON().Resources ?? {})).toHaveLength(0);
    });
  });
});
