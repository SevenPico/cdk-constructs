import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { makeContext } from '@sevenpico/cdk-context';
import { Eventbridge } from '../src/eventbridge';

function makeStack(): Stack {
  const app = new App();
  return new Stack(app, 'TestStack');
}

const CONTEXT = makeContext({ namespace: 'acme', environment: 'dev', stage: 'app' });

describe('Example: minimal', () => {
  let template: Template;
  beforeAll(() => {
    const stack = makeStack();
    new Eventbridge(stack, 'Bus', { context: CONTEXT });
    template = Template.fromStack(stack);
  });
  test('creates exactly 1 event bus', () => {
    template.resourceCountIs('AWS::Events::EventBus', 1);
  });
});

describe('Example: comprehensive', () => {
  let template: Template;
  beforeAll(() => {
    const stack = makeStack();
    new Eventbridge(stack, 'Bus', {
      context: CONTEXT,
      eventBusName: 'acme-dev-app-events',
    });
    template = Template.fromStack(stack);
  });
  test('creates exactly 1 event bus', () => {
    template.resourceCountIs('AWS::Events::EventBus', 1);
  });
  test('event bus name is set', () => {
    template.hasResourceProperties('AWS::Events::EventBus', {
      Name: 'acme-dev-app-events',
    });
  });
});

describe('Example: disabled', () => {
  let template: Template;
  beforeAll(() => {
    const stack = makeStack();
    new Eventbridge(stack, 'Bus', {
      context: makeContext({ namespace: 'acme', environment: 'dev', stage: 'app', enabled: false }),
    });
    template = Template.fromStack(stack);
  });
  test('creates zero event buses when disabled', () => {
    template.resourceCountIs('AWS::Events::EventBus', 0);
  });
});
