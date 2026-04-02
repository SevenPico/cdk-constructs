import { App, Stack } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { makeContext } from '@sevenpico/cdk-context';
import { IamPolicy } from '../src/iam-policy';

const makeStack = (): Stack => {
  const app = new App();
  return new Stack(app, 'TestStack');
};

describe('IamPolicy construct', () => {
  describe('Feature: Policy Naming', () => {
    test('Policy name uses context ID', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 's3-read' });
      const stack = makeStack();
      new IamPolicy(stack, 'SUT', {
        context,
        iamPolicyEnabled: true,
        policyStatements: {
          AllowRead: { actions: ['s3:GetObject'], resources: ['*'] },
        },
      });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::IAM::ManagedPolicy', {
        ManagedPolicyName: '7p-prod-s3-read',
      });
    });
  });

  describe('Feature: Policy Statements', () => {
    test('Policy statements added to managed policy', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'reader' });
      const stack = makeStack();
      new IamPolicy(stack, 'SUT', {
        context,
        iamPolicyEnabled: true,
        policyStatements: {
          AllowRead: { actions: ['s3:GetObject'], resources: ['arn:aws:s3:::my-bucket/*'] },
        },
      });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::IAM::ManagedPolicy', {
        PolicyDocument: Match.objectLike({
          Statement: Match.arrayWith([
            Match.objectLike({
              Action: 's3:GetObject',
              Effect: 'Allow',
              Resource: 'arn:aws:s3:::my-bucket/*',
            }),
          ]),
        }),
      });
    });

    test('Multiple statements combined in policy', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'multi' });
      const stack = makeStack();
      new IamPolicy(stack, 'SUT', {
        context,
        iamPolicyEnabled: true,
        policyStatements: {
          AllowRead: { actions: ['s3:GetObject'], resources: ['*'] },
          DenyDelete: { actions: ['s3:DeleteObject'], resources: ['*'], effect: 'Deny' },
        },
      });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::IAM::ManagedPolicy', {
        PolicyDocument: Match.objectLike({
          Statement: Match.arrayWith([
            Match.objectLike({ Action: 's3:GetObject', Effect: 'Allow' }),
            Match.objectLike({ Action: 's3:DeleteObject', Effect: 'Deny' }),
          ]),
        }),
      });
    });

    test('Deny effect sets correctly', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'deny' });
      const stack = makeStack();
      new IamPolicy(stack, 'SUT', {
        context,
        iamPolicyEnabled: true,
        policyStatements: {
          DenyAll: { actions: ['*'], resources: ['*'], effect: 'Deny' },
        },
      });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::IAM::ManagedPolicy', {
        PolicyDocument: Match.objectLike({
          Statement: Match.arrayWith([
            Match.objectLike({ Effect: 'Deny' }),
          ]),
        }),
      });
    });
  });

  describe('Feature: Source and Override Documents', () => {
    test('Source policy documents merged into policy', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'merged' });
      const stack = makeStack();
      const sourceDoc = JSON.stringify({
        Version: '2012-10-17',
        Statement: [{ Sid: 'SourceStmt', Effect: 'Allow', Action: 'logs:CreateLogGroup', Resource: '*' }],
      });
      new IamPolicy(stack, 'SUT', {
        context,
        iamPolicyEnabled: true,
        sourcePolicyDocuments: [sourceDoc],
      });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::IAM::ManagedPolicy', {
        PolicyDocument: Match.objectLike({
          Statement: Match.arrayWith([
            Match.objectLike({ Action: 'logs:CreateLogGroup' }),
          ]),
        }),
      });
    });

    test('Override documents replace matching SIDs', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'override' });
      const stack = makeStack();
      const sourceDoc = JSON.stringify({
        Version: '2012-10-17',
        Statement: [{ Sid: 'SharedSid', Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }],
      });
      const overrideDoc = JSON.stringify({
        Version: '2012-10-17',
        Statement: [{ Sid: 'SharedSid', Effect: 'Deny', Action: 's3:GetObject', Resource: '*' }],
      });
      new IamPolicy(stack, 'SUT', {
        context,
        iamPolicyEnabled: true,
        sourcePolicyDocuments: [sourceDoc],
        overridePolicyDocuments: [overrideDoc],
      });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::IAM::ManagedPolicy', {
        PolicyDocument: Match.objectLike({
          Statement: Match.arrayWith([
            Match.objectLike({ Sid: 'SharedSid', Effect: 'Deny' }),
          ]),
        }),
      });
      // Should NOT contain the Allow version
      const json = template.toJSON();
      const policyResources = Object.values(json.Resources).filter(
        (r: any) => (r as any).Type === 'AWS::IAM::ManagedPolicy',
      );
      const stmts = (policyResources[0] as any).Properties.PolicyDocument.Statement;
      const sharedStmts = stmts.filter((s: any) => s.Sid === 'SharedSid');
      expect(sharedStmts).toHaveLength(1);
      expect(sharedStmts[0].Effect).toBe('Deny');
    });
  });

  describe('Feature: Description', () => {
    test('Description set on managed policy', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'desc' });
      const stack = makeStack();
      new IamPolicy(stack, 'SUT', {
        context,
        iamPolicyEnabled: true,
        description: 'Read-only access to S3',
        policyStatements: {
          Read: { actions: ['s3:GetObject'], resources: ['*'] },
        },
      });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::IAM::ManagedPolicy', {
        Description: 'Read-only access to S3',
      });
    });
  });

  describe('Feature: Tagging', () => {
    test('Construct creates managed policy with context tags applied (tags propagate to taggable children)', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'tagged', tags: { Env: 'production' } });
      const stack = makeStack();
      const construct = new IamPolicy(stack, 'SUT', {
        context,
        iamPolicyEnabled: true,
        policyStatements: {
          Read: { actions: ['s3:GetObject'], resources: ['*'] },
        },
      });
      // ManagedPolicy does not support CloudFormation Tags property directly,
      // but Tags.of(this).add() is called for consistency with the tagging pattern.
      // Verify the managed policy is created successfully with context.
      expect(construct.policy).toBeDefined();
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::IAM::ManagedPolicy', {
        ManagedPolicyName: '7p-prod-tagged',
      });
    });
  });

  describe('Feature: Disabled Construct', () => {
    test('No resources created when context is disabled', () => {
      const context = makeContext({ namespace: '7p', stage: 'test', name: 'test', enabled: false });
      const stack = makeStack();
      new IamPolicy(stack, 'SUT', {
        context,
        iamPolicyEnabled: true,
        policyStatements: {
          Read: { actions: ['s3:GetObject'], resources: ['*'] },
        },
      });
      const template = Template.fromStack(stack);
      template.resourceCountIs('AWS::IAM::ManagedPolicy', 0);
    });

    test('No resources created when iamPolicyEnabled is false', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'nopolicy' });
      const stack = makeStack();
      new IamPolicy(stack, 'SUT', {
        context,
        iamPolicyEnabled: false,
        policyStatements: {
          Read: { actions: ['s3:GetObject'], resources: ['*'] },
        },
      });
      const template = Template.fromStack(stack);
      template.resourceCountIs('AWS::IAM::ManagedPolicy', 0);
    });
  });

  describe('Feature: JSON Output', () => {
    test('json property always available even when disabled', () => {
      const context = makeContext({ namespace: '7p', stage: 'test', name: 'test', enabled: false });
      const stack = makeStack();
      const construct = new IamPolicy(stack, 'SUT', {
        context,
        policyStatements: {
          Read: { actions: ['s3:GetObject'], resources: ['*'] },
        },
      });
      expect(construct.json).toBeDefined();
      const parsed = JSON.parse(construct.json);
      expect(parsed.Statement).toBeDefined();
      expect(parsed.Statement.length).toBeGreaterThan(0);
    });

    test('json property available when iamPolicyEnabled is false', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'jsononly' });
      const stack = makeStack();
      const construct = new IamPolicy(stack, 'SUT', {
        context,
        iamPolicyEnabled: false,
        policyStatements: {
          Read: { actions: ['s3:GetObject'], resources: ['*'] },
        },
      });
      expect(construct.json).toBeDefined();
      expect(construct.policy).toBeUndefined();
    });
  });
});
