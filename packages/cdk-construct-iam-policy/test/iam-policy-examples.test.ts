import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { makeContext } from '@sevenpico/cdk-context';
import { IamPolicy } from '../src/iam-policy';

function makeStack(): Stack {
  const app = new App();
  return new Stack(app, 'TestStack');
}

const CONTEXT = makeContext({ namespace: 'acme', environment: 'dev', stage: 'app' });

describe('Example: minimal', () => {
  let template: Template;
  beforeAll(() => {
    const stack = makeStack();
    new IamPolicy(stack, 'Policy', {
      context: CONTEXT,
      iamPolicyEnabled: true,
      policyStatements: {
        AllowS3Read: {
          effect: 'Allow',
          actions: ['s3:GetObject', 's3:ListBucket'],
          resources: ['*'],
        },
      },
    });
    template = Template.fromStack(stack);
  });
  test('creates 1 managed policy', () => {
    template.resourceCountIs('AWS::IAM::ManagedPolicy', 1);
  });
});

describe('Example: comprehensive', () => {
  let template: Template;
  beforeAll(() => {
    const stack = makeStack();
    new IamPolicy(stack, 'Policy', {
      context: CONTEXT,
      iamPolicyEnabled: true,
      description: 'Acme application read/write policy',
      policyStatements: {
        AllowS3Read: {
          effect: 'Allow',
          actions: ['s3:GetObject', 's3:ListBucket'],
          resources: ['arn:aws:s3:::acme-dev-app-*', 'arn:aws:s3:::acme-dev-app-*/*'],
        },
        AllowDynamoDBWrite: {
          effect: 'Allow',
          actions: ['dynamodb:PutItem', 'dynamodb:UpdateItem', 'dynamodb:GetItem'],
          resources: ['arn:aws:dynamodb:us-east-1:123456789012:table/acme-dev-app-*'],
        },
        DenyDelete: {
          effect: 'Deny',
          actions: ['s3:DeleteObject', 'dynamodb:DeleteItem'],
          resources: ['*'],
        },
      },
    });
    template = Template.fromStack(stack);
  });
  test('creates 1 managed policy', () => {
    template.resourceCountIs('AWS::IAM::ManagedPolicy', 1);
  });
  test('policy has description', () => {
    template.hasResourceProperties('AWS::IAM::ManagedPolicy', {
      Description: 'Acme application read/write policy',
    });
  });
});

describe('Example: disabled', () => {
  let template: Template;
  beforeAll(() => {
    const stack = makeStack();
    new IamPolicy(stack, 'Policy', {
      context: makeContext({ namespace: 'acme', environment: 'dev', stage: 'app', enabled: false }),
      iamPolicyEnabled: true,
      policyStatements: {
        AllowS3Read: {
          effect: 'Allow',
          actions: ['s3:GetObject', 's3:ListBucket'],
          resources: ['*'],
        },
      },
    });
    template = Template.fromStack(stack);
  });
  test('creates zero managed policies when disabled', () => {
    template.resourceCountIs('AWS::IAM::ManagedPolicy', 0);
  });
});
