import { makeContext } from '@sevenpico/cdk-context';
import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { Sns } from '../src/sns';

function makeStack(): Stack {
  const app = new App();
  return new Stack(app, 'TestStack');
}

const CONTEXT = makeContext({ namespace: 'acme', environment: 'dev', stage: 'app' });

describe('Example: minimal', () => {
  let template: Template;
  beforeAll(() => {
    const stack = makeStack();
    new Sns(stack, 'Topic', { context: CONTEXT });
    template = Template.fromStack(stack);
  });
  test('creates exactly 1 SNS topic', () => {
    template.resourceCountIs('AWS::SNS::Topic', 1);
  });
});

describe('Example: comprehensive', () => {
  let template: Template;
  beforeAll(() => {
    const stack = makeStack();
    new Sns(stack, 'Topic', {
      context: CONTEXT,
      encryptionEnabled: true,
      allowedAwsServicesForPublish: ['events.amazonaws.com'],
      sqsDlqEnabled: true,
    });
    template = Template.fromStack(stack);
  });
  test('creates exactly 1 SNS topic', () => {
    template.resourceCountIs('AWS::SNS::Topic', 1);
  });
  test('creates a DLQ when sqsDlqEnabled', () => {
    template.resourceCountIs('AWS::SQS::Queue', 1);
  });
});

describe('Example: disabled', () => {
  let template: Template;
  beforeAll(() => {
    const stack = makeStack();
    new Sns(stack, 'Topic', {
      context: makeContext({ namespace: 'acme', environment: 'dev', stage: 'app', enabled: false }),
    });
    template = Template.fromStack(stack);
  });
  test('creates zero SNS topics when disabled', () => {
    template.resourceCountIs('AWS::SNS::Topic', 0);
  });
});
