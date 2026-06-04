import { makeContext } from '@sevenpico/cdk-context';
import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { IamRole } from '../src/iam-role';

function makeStack(): Stack {
  const app = new App();
  return new Stack(app, 'TestStack');
}

const CONTEXT = makeContext({ namespace: 'acme', environment: 'dev', stage: 'app' });

describe('Example: minimal', () => {
  let template: Template;
  beforeAll(() => {
    const stack = makeStack();
    new IamRole(stack, 'Role', {
      context: CONTEXT,
      roleDescription: 'Acme application role',
      principals: { Service: ['lambda.amazonaws.com'] },
    });
    template = Template.fromStack(stack);
  });
  test('creates 1 IAM role', () => {
    template.resourceCountIs('AWS::IAM::Role', 1);
  });
});

describe('Example: comprehensive', () => {
  let template: Template;
  beforeAll(() => {
    const stack = makeStack();
    new IamRole(stack, 'Role', {
      context: CONTEXT,
      roleDescription: 'Acme EC2 instance role with S3 access',
      principals: { Service: ['ec2.amazonaws.com'] },
      managedPolicyArns: ['arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore'],
      instanceProfileEnabled: true,
      maxSessionDuration: 7200,
      policyDocuments: [
        JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Action: ['s3:GetObject', 's3:PutObject'],
              Resource: 'arn:aws:s3:::acme-dev-app-*/*',
            },
          ],
        }),
      ],
    });
    template = Template.fromStack(stack);
  });
  test('creates 1 IAM role', () => {
    template.resourceCountIs('AWS::IAM::Role', 1);
  });
  test('creates instance profile', () => {
    template.resourceCountIs('AWS::IAM::InstanceProfile', 1);
  });
  test('role has max session duration', () => {
    template.hasResourceProperties('AWS::IAM::Role', {
      MaxSessionDuration: 7200,
    });
  });
});

describe('Example: disabled', () => {
  let template: Template;
  beforeAll(() => {
    const stack = makeStack();
    new IamRole(stack, 'Role', {
      context: makeContext({ namespace: 'acme', environment: 'dev', stage: 'app', enabled: false }),
      roleDescription: 'Acme application role',
      principals: { Service: ['lambda.amazonaws.com'] },
    });
    template = Template.fromStack(stack);
  });
  test('creates zero IAM roles when disabled', () => {
    template.resourceCountIs('AWS::IAM::Role', 0);
  });
});
