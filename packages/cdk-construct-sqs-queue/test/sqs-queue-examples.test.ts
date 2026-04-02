import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { makeContext } from '@sevenpico/cdk-context';
import { SqsQueue } from '../src/sqs-queue';

function makeStack(): Stack {
  const app = new App();
  return new Stack(app, 'TestStack');
}

const CONTEXT = makeContext({ namespace: 'acme', environment: 'dev', stage: 'app' });

describe('Example: minimal', () => {
  let template: Template;
  beforeAll(() => {
    const stack = makeStack();
    new SqsQueue(stack, 'Queue', { context: CONTEXT });
    template = Template.fromStack(stack);
  });
  test('creates exactly 1 SQS queue', () => {
    template.resourceCountIs('AWS::SQS::Queue', 1);
  });
});

describe('Example: comprehensive', () => {
  let template: Template;
  beforeAll(() => {
    const stack = makeStack();
    new SqsQueue(stack, 'Queue', {
      context: CONTEXT,
      visibilityTimeoutSeconds: 300,
      messageRetentionSeconds: 86400,
      dlqEnabled: true,
      sqsManagedSseEnabled: true,
    });
    template = Template.fromStack(stack);
  });
  test('creates main queue plus DLQ', () => {
    template.resourceCountIs('AWS::SQS::Queue', 2);
  });
  test('visibility timeout is set', () => {
    template.hasResourceProperties('AWS::SQS::Queue', {
      VisibilityTimeout: 300,
    });
  });
});

describe('Example: disabled', () => {
  let template: Template;
  beforeAll(() => {
    const stack = makeStack();
    new SqsQueue(stack, 'Queue', {
      context: makeContext({ namespace: 'acme', environment: 'dev', stage: 'app', enabled: false }),
    });
    template = Template.fromStack(stack);
  });
  test('creates zero queues when disabled', () => {
    template.resourceCountIs('AWS::SQS::Queue', 0);
  });
});
