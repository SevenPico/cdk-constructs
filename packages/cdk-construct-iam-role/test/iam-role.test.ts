import { App, Stack } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { makeContext, Context } from '@sevenpico/cdk-context';
import { loadFeature, defineFeature } from 'jest-cucumber';
import path from 'path';
import { IamRole } from '../src/iam-role';
import { IamRoleProps } from '../src/iam-role-types';

const feature = loadFeature(path.join(__dirname, 'iam-role.feature'));

const makeStack = (): Stack => {
  const app = new App();
  return new Stack(app, 'TestStack');
};

defineFeature(feature, (test: any) => {
  let context: Context;
  let stack: Stack;
  let template: Template;
  let extraProps: Partial<IamRoleProps>;

  test('Role name uses context ID', ({ given, when, then }: any) => {
    given(/^a context with namespace "(.+)", stage "(.+)", name "(.+)"$/, (ns: string, stage: string, name: string) => {
      context = makeContext({ namespace: ns, stage, name });
      extraProps = {};
    });
    when('an IamRole construct is created', () => {
      stack = makeStack();
      new IamRole(stack, 'SUT', { context, roleDescription: 'Test role', ...extraProps } as IamRoleProps);
      template = Template.fromStack(stack);
    });
    then(/^an IAM Role exists with RoleName "(.+)"$/, (roleName: string) => {
      template.hasResourceProperties('AWS::IAM::Role', {
        RoleName: roleName,
      });
    });
  });

  test('Lambda service principal in assume role policy', ({ given, when, then }: any) => {
    given(/^a context with principals Service "(.+)"$/, (service: string) => {
      context = makeContext({ namespace: '7p', stage: 'prod', name: 'lambda' });
      extraProps = { principals: { Service: [service] } };
    });
    when('an IamRole construct is created', () => {
      stack = makeStack();
      new IamRole(stack, 'SUT', { context, roleDescription: 'Test role', ...extraProps } as IamRoleProps);
      template = Template.fromStack(stack);
    });
    then(/^the role trust policy allows "(.+)"$/, (service: string) => {
      template.hasResourceProperties('AWS::IAM::Role', {
        AssumeRolePolicyDocument: Match.objectLike({
          Statement: Match.arrayWith([
            Match.objectLike({
              Principal: Match.objectLike({
                Service: Match.arrayWith([service]),
              }),
            }),
          ]),
        }),
      });
    });
  });

  test('Managed policy attached when managedPolicyArns provided', ({ given, when, then }: any) => {
    given(/^a context with managed policy "(.+)"$/, (arn: string) => {
      context = makeContext({ namespace: '7p', stage: 'prod', name: 'lambda' });
      extraProps = { managedPolicyArns: [arn] };
    });
    when('an IamRole construct is created', () => {
      stack = makeStack();
      new IamRole(stack, 'SUT', { context, roleDescription: 'Test role', ...extraProps } as IamRoleProps);
      template = Template.fromStack(stack);
    });
    then('the role has the managed policy attached', () => {
      const resources = template.toJSON().Resources;
      const roleResource = Object.values(resources).find(
        (r: any) => (r as any).Type === 'AWS::IAM::Role',
      ) as any;
      expect(roleResource.Properties.ManagedPolicyArns).toBeDefined();
      expect(roleResource.Properties.ManagedPolicyArns.length).toBeGreaterThan(0);
    });
  });

  test('Context tags applied to role', ({ given, when, then }: any) => {
    given(/^a context with tags Env "(.+)"$/, (envTag: string) => {
      context = makeContext({ namespace: '7p', stage: 'prod', name: 'lambda', tags: { Env: envTag } });
      extraProps = {};
    });
    when('an IamRole construct is created', () => {
      stack = makeStack();
      new IamRole(stack, 'SUT', { context, roleDescription: 'Test role', ...extraProps } as IamRoleProps);
      template = Template.fromStack(stack);
    });
    then(/^the IAM role has the tag Env "(.+)"$/, (envTag: string) => {
      template.hasResourceProperties('AWS::IAM::Role', {
        Tags: Match.arrayWith([
          Match.objectLike({ Key: 'Env', Value: envTag }),
        ]),
      });
    });
  });

  test('No resources created when context is disabled', ({ given, when, then }: any) => {
    given('a context with enabled false', () => {
      context = makeContext({ namespace: '7p', stage: 'test', name: 'test', enabled: false });
      extraProps = {};
    });
    when('an IamRole construct is created', () => {
      stack = makeStack();
      new IamRole(stack, 'SUT', { context, roleDescription: 'Test role', ...extraProps } as IamRoleProps);
      template = Template.fromStack(stack);
    });
    then('no IAM Role resources exist in the stack', () => {
      template.resourceCountIs('AWS::IAM::Role', 0);
    });
  });
});
