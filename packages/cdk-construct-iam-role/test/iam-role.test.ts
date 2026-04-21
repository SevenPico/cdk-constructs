import { makeContext } from '@sevenpico/cdk-context';
import { App, Stack } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { IamRole } from '../src/iam-role';

const makeStack = (): Stack => {
  const app = new App();
  return new Stack(app, 'TestStack');
};

describe('IamRole construct', () => {
  describe('Feature: Role Naming', () => {
    test('Role name uses context ID', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'lambda' });
      const stack = makeStack();
      new IamRole(stack, 'SUT', {
        context,
        roleDescription: 'Lambda execution role',
        principals: { Service: ['lambda.amazonaws.com'] },
      });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::IAM::Role', {
        RoleName: '7p-prod-lambda',
      });
    });
  });

  describe('Feature: Trust Policy', () => {
    test('Lambda service principal in assume role policy', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'lambda' });
      const stack = makeStack();
      new IamRole(stack, 'SUT', {
        context,
        roleDescription: 'Lambda execution role',
        principals: { Service: ['lambda.amazonaws.com'] },
      });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::IAM::Role', {
        AssumeRolePolicyDocument: Match.objectLike({
          Statement: Match.arrayWith([
            Match.objectLike({
              Principal: Match.objectLike({
                Service: 'lambda.amazonaws.com',
              }),
            }),
          ]),
        }),
      });
    });

    test('AWS account principal in assume role policy', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'cross' });
      const stack = makeStack();
      new IamRole(stack, 'SUT', {
        context,
        roleDescription: 'Cross-account role',
        principals: { AWS: ['arn:aws:iam::123456789:root'] },
      });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::IAM::Role', {
        AssumeRolePolicyDocument: Match.objectLike({
          Statement: Match.arrayWith([
            Match.objectLike({
              Principal: Match.objectLike({
                AWS: 'arn:aws:iam::123456789:root',
              }),
            }),
          ]),
        }),
      });
    });
  });

  describe('Feature: Managed Policies', () => {
    test('Managed policy attached when policyArns provided', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'reader' });
      const stack = makeStack();
      new IamRole(stack, 'SUT', {
        context,
        roleDescription: 'Read-only role',
        principals: { Service: ['lambda.amazonaws.com'] },
        managedPolicyArns: ['arn:aws:iam::aws:policy/ReadOnlyAccess'],
      });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::IAM::Role', {
        ManagedPolicyArns: Match.arrayWith([
          'arn:aws:iam::aws:policy/ReadOnlyAccess',
        ]),
      });
    });
  });

  describe('Feature: Inline Policies', () => {
    test('Inline policy added when inlinePolicies provided', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'writer' });
      const stack = makeStack();
      const policyDoc = JSON.stringify({
        Version: '2012-10-17',
        Statement: [{ Effect: 'Allow', Action: 's3:PutObject', Resource: '*' }],
      });
      new IamRole(stack, 'SUT', {
        context,
        roleDescription: 'Writer role',
        principals: { Service: ['lambda.amazonaws.com'] },
        inlinePolicies: { 's3-write': policyDoc },
      });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::IAM::Policy', {
        PolicyName: 's3-write',
        PolicyDocument: Match.objectLike({
          Statement: Match.arrayWith([
            Match.objectLike({
              Action: 's3:PutObject',
              Effect: 'Allow',
            }),
          ]),
        }),
      });
    });

    test('Merged policyDocuments creates inline policy', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'merged' });
      const stack = makeStack();
      const doc1 = JSON.stringify({
        Version: '2012-10-17',
        Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }],
      });
      new IamRole(stack, 'SUT', {
        context,
        roleDescription: 'Merged role',
        principals: { Service: ['lambda.amazonaws.com'] },
        policyDocuments: [doc1],
      });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::IAM::Policy', {
        PolicyName: '7p-prod-merged-policy',
      });
    });
  });

  describe('Feature: Instance Profile', () => {
    test('Instance profile created when enabled', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'ec2' });
      const stack = makeStack();
      new IamRole(stack, 'SUT', {
        context,
        roleDescription: 'EC2 role',
        principals: { Service: ['ec2.amazonaws.com'] },
        instanceProfileEnabled: true,
      });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::IAM::InstanceProfile', {
        InstanceProfileName: '7p-prod-ec2',
      });
    });

    test('No instance profile when not enabled', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'lambda' });
      const stack = makeStack();
      new IamRole(stack, 'SUT', {
        context,
        roleDescription: 'Lambda role',
        principals: { Service: ['lambda.amazonaws.com'] },
      });
      const template = Template.fromStack(stack);
      template.resourceCountIs('AWS::IAM::InstanceProfile', 0);
    });
  });

  describe('Feature: Tagging', () => {
    test('Context tags applied to role', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'lambda', tags: { Env: 'production' } });
      const stack = makeStack();
      new IamRole(stack, 'SUT', {
        context,
        roleDescription: 'Lambda role',
        principals: { Service: ['lambda.amazonaws.com'] },
      });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::IAM::Role', {
        Tags: Match.arrayWith([
          Match.objectLike({ Key: 'Env', Value: 'production' }),
        ]),
      });
    });

    test('No tags when tagsEnabled is false', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'lambda', tags: { Env: 'production' } });
      const stack = makeStack();
      new IamRole(stack, 'SUT', {
        context,
        roleDescription: 'Lambda role',
        principals: { Service: ['lambda.amazonaws.com'] },
        tagsEnabled: false,
      });
      const template = Template.fromStack(stack);
      const resources = template.toJSON().Resources;
      const roleResource = Object.values(resources).find(
        (r: any) => (r as any).Type === 'AWS::IAM::Role',
      ) as any;
      expect(roleResource.Properties.Tags ?? []).not.toEqual(
        expect.arrayContaining([expect.objectContaining({ Key: 'Env' })]),
      );
    });
  });

  describe('Feature: Disabled Construct', () => {
    test('No resources created when context is disabled', () => {
      const context = makeContext({ namespace: '7p', stage: 'test', name: 'test', enabled: false });
      const stack = makeStack();
      new IamRole(stack, 'SUT', {
        context,
        roleDescription: 'test',
      });
      const template = Template.fromStack(stack);
      template.resourceCountIs('AWS::IAM::Role', 0);
    });
  });

  describe('Feature: Role Configuration', () => {
    test('Description is set correctly', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'lambda' });
      const stack = makeStack();
      new IamRole(stack, 'SUT', {
        context,
        roleDescription: 'Lambda execution role for processing orders',
        principals: { Service: ['lambda.amazonaws.com'] },
      });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::IAM::Role', {
        Description: 'Lambda execution role for processing orders',
      });
    });

    test('Custom path is set correctly', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'lambda' });
      const stack = makeStack();
      new IamRole(stack, 'SUT', {
        context,
        roleDescription: 'Lambda role',
        principals: { Service: ['lambda.amazonaws.com'] },
        path: '/service-roles/',
      });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::IAM::Role', {
        Path: '/service-roles/',
      });
    });

    test('Max session duration is set correctly', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'lambda' });
      const stack = makeStack();
      new IamRole(stack, 'SUT', {
        context,
        roleDescription: 'Lambda role',
        principals: { Service: ['lambda.amazonaws.com'] },
        maxSessionDuration: 7200,
      });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::IAM::Role', {
        MaxSessionDuration: 7200,
      });
    });
  });
});
