import { makeContext } from '@sevenpico/cdk-context';
import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { EventbridgeRule } from '../src/eventbridge-rule';

function makeStack(): Stack {
  const app = new App();
  return new Stack(app, 'TestStack');
}

const CONTEXT = makeContext({ namespace: 'acme', environment: 'dev', stage: 'app' });
const TARGET_ARN = 'arn:aws:sqs:us-east-1:123456789012:acme-dev-app';

describe('Example: minimal', () => {
  let template: Template;
  beforeAll(() => {
    const stack = makeStack();
    new EventbridgeRule(stack, 'Rule', {
      context: CONTEXT,
      eventPattern: { source: ['acme.app'] },
      targetArn: TARGET_ARN,
    });
    template = Template.fromStack(stack);
  });
  test('creates exactly 1 EventBridge rule', () => {
    template.resourceCountIs('AWS::Events::Rule', 1);
  });
});

describe('Example: comprehensive', () => {
  let template: Template;
  beforeAll(() => {
    const stack = makeStack();
    new EventbridgeRule(stack, 'Rule', {
      context: CONTEXT,
      description: 'Route acme.app order events to processing queue',
      eventPattern: {
        'source': ['acme.app'],
        'detail-type': ['OrderPlaced'],
      },
      targetArn: 'arn:aws:sqs:us-east-1:123456789012:acme-dev-app-orders',
      ruleEnabled: true,
    });
    template = Template.fromStack(stack);
  });
  test('creates exactly 1 EventBridge rule', () => {
    template.resourceCountIs('AWS::Events::Rule', 1);
  });
  test('rule description is set', () => {
    template.hasResourceProperties('AWS::Events::Rule', {
      Description: 'Route acme.app order events to processing queue',
    });
  });
  test('event pattern source is set', () => {
    template.hasResourceProperties('AWS::Events::Rule', {
      EventPattern: {
        'source': ['acme.app'],
        'detail-type': ['OrderPlaced'],
      },
    });
  });
});

describe('Example: disabled', () => {
  let template: Template;
  beforeAll(() => {
    const stack = makeStack();
    new EventbridgeRule(stack, 'Rule', {
      context: makeContext({ namespace: 'acme', environment: 'dev', stage: 'app', enabled: false }),
      eventPattern: { source: ['acme.app'] },
      targetArn: TARGET_ARN,
    });
    template = Template.fromStack(stack);
  });
  test('creates zero rules when disabled', () => {
    template.resourceCountIs('AWS::Events::Rule', 0);
  });
});
