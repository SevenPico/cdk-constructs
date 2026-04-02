import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { makeContext } from '@sevenpico/cdk-context';
import { IamUser } from '../src/iam-user';

function makeStack(): Stack {
  const app = new App();
  return new Stack(app, 'TestStack');
}

const CONTEXT = makeContext({ namespace: 'acme', environment: 'dev', stage: 'app' });

describe('Example: minimal', () => {
  let template: Template;
  beforeAll(() => {
    const stack = makeStack();
    new IamUser(stack, 'User', {
      context: CONTEXT,
      userName: 'alice@example.com',
    });
    template = Template.fromStack(stack);
  });
  test('creates 1 IAM user', () => {
    template.resourceCountIs('AWS::IAM::User', 1);
  });
});

describe('Example: comprehensive', () => {
  let template: Template;
  beforeAll(() => {
    const stack = makeStack();
    new IamUser(stack, 'User', {
      context: CONTEXT,
      userName: 'alice@example.com',
      path: '/engineering/',
      groups: ['developers', 'readonly'],
      loginProfileEnabled: true,
      passwordResetRequired: true,
      passwordLength: 32,
    });
    template = Template.fromStack(stack);
  });
  test('creates 1 IAM user', () => {
    template.resourceCountIs('AWS::IAM::User', 1);
  });
  test('user has correct path', () => {
    template.hasResourceProperties('AWS::IAM::User', {
      Path: '/engineering/',
    });
  });
});

describe('Example: disabled', () => {
  let template: Template;
  beforeAll(() => {
    const stack = makeStack();
    new IamUser(stack, 'User', {
      context: makeContext({ namespace: 'acme', environment: 'dev', stage: 'app', enabled: false }),
      userName: 'alice@example.com',
    });
    template = Template.fromStack(stack);
  });
  test('creates zero IAM users when disabled', () => {
    template.resourceCountIs('AWS::IAM::User', 0);
  });
});
