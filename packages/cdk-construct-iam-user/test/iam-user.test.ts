import { App, Stack } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { makeContext } from '@sevenpico/cdk-context';
import { IamUser } from '../src/iam-user';

const makeStack = (): Stack => {
  const app = new App();
  return new Stack(app, 'TestStack');
};

describe('IamUser construct', () => {
  describe('Feature: User Naming', () => {
    test('User name set from props', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'ci' });
      const stack = makeStack();
      new IamUser(stack, 'SUT', {
        context,
        userName: 'ci-deploy@example.com',
      });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::IAM::User', {
        UserName: 'ci-deploy@example.com',
      });
    });

    test('Custom path is set correctly', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'ci' });
      const stack = makeStack();
      new IamUser(stack, 'SUT', {
        context,
        userName: 'ci-deploy',
        path: '/service-accounts/',
      });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::IAM::User', {
        Path: '/service-accounts/',
      });
    });

    test('Default path is /', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'ci' });
      const stack = makeStack();
      new IamUser(stack, 'SUT', {
        context,
        userName: 'ci-deploy',
      });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::IAM::User', {
        Path: '/',
      });
    });
  });

  describe('Feature: Group Membership', () => {
    test('User added to group when groups provided', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'dev' });
      const stack = makeStack();
      new IamUser(stack, 'SUT', {
        context,
        userName: 'developer@example.com',
        groups: ['developers'],
      });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::IAM::User', {
        Groups: Match.arrayWith(['developers']),
      });
    });

    test('User added to multiple groups', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'dev' });
      const stack = makeStack();
      new IamUser(stack, 'SUT', {
        context,
        userName: 'developer@example.com',
        groups: ['developers', 'admins'],
      });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::IAM::User', {
        Groups: Match.arrayWith(['developers', 'admins']),
      });
    });

    test('No groups when groups not provided', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'solo' });
      const stack = makeStack();
      new IamUser(stack, 'SUT', {
        context,
        userName: 'solo@example.com',
      });
      const template = Template.fromStack(stack);
      const json = template.toJSON();
      const userResource = Object.values(json.Resources).find(
        (r: any) => (r as any).Type === 'AWS::IAM::User',
      ) as any;
      expect(userResource.Properties.Groups).toBeUndefined();
    });
  });

  describe('Feature: Permissions Boundary', () => {
    test('Permissions boundary attached when provided', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'bounded' });
      const stack = makeStack();
      new IamUser(stack, 'SUT', {
        context,
        userName: 'bounded@example.com',
        permissionsBoundary: 'arn:aws:iam::123456789012:policy/Boundary',
      });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::IAM::User', {
        PermissionsBoundary: 'arn:aws:iam::123456789012:policy/Boundary',
      });
    });

    test('No permissions boundary when not provided', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'free' });
      const stack = makeStack();
      new IamUser(stack, 'SUT', {
        context,
        userName: 'free@example.com',
      });
      const template = Template.fromStack(stack);
      const json = template.toJSON();
      const userResource = Object.values(json.Resources).find(
        (r: any) => (r as any).Type === 'AWS::IAM::User',
      ) as any;
      expect(userResource.Properties.PermissionsBoundary).toBeUndefined();
    });
  });

  describe('Feature: Login Profile', () => {
    test('Login profile enabled by default with password reset required', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'console' });
      const stack = makeStack();
      new IamUser(stack, 'SUT', {
        context,
        userName: 'console@example.com',
      });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::IAM::User', {
        LoginProfile: Match.objectLike({
          PasswordResetRequired: true,
        }),
      });
    });

    test('Login profile disabled when loginProfileEnabled is false', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'nologin' });
      const stack = makeStack();
      new IamUser(stack, 'SUT', {
        context,
        userName: 'nologin@example.com',
        loginProfileEnabled: false,
      });
      const template = Template.fromStack(stack);
      const json = template.toJSON();
      const userResource = Object.values(json.Resources).find(
        (r: any) => (r as any).Type === 'AWS::IAM::User',
      ) as any;
      expect(userResource.Properties.LoginProfile).toBeUndefined();
    });

    test('Password reset required can be disabled', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'noreset' });
      const stack = makeStack();
      new IamUser(stack, 'SUT', {
        context,
        userName: 'noreset@example.com',
        passwordResetRequired: false,
      });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::IAM::User', {
        LoginProfile: Match.objectLike({
          PasswordResetRequired: false,
        }),
      });
    });
  });

  describe('Feature: Tagging', () => {
    test('Context tags applied to user', () => {
      const context = makeContext({ namespace: '7p', stage: 'prod', name: 'tagged', tags: { Env: 'production' } });
      const stack = makeStack();
      new IamUser(stack, 'SUT', {
        context,
        userName: 'tagged@example.com',
      });
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::IAM::User', {
        Tags: Match.arrayWith([
          Match.objectLike({ Key: 'Env', Value: 'production' }),
        ]),
      });
    });
  });

  describe('Feature: Disabled Construct', () => {
    test('No resources created when context is disabled', () => {
      const context = makeContext({ namespace: '7p', stage: 'test', name: 'test', enabled: false });
      const stack = makeStack();
      new IamUser(stack, 'SUT', {
        context,
        userName: 'disabled@example.com',
      });
      const template = Template.fromStack(stack);
      template.resourceCountIs('AWS::IAM::User', 0);
    });

    test('user property is undefined when disabled', () => {
      const context = makeContext({ namespace: '7p', stage: 'test', name: 'test', enabled: false });
      const stack = makeStack();
      const construct = new IamUser(stack, 'SUT', {
        context,
        userName: 'disabled@example.com',
      });
      expect(construct.user).toBeUndefined();
    });
  });
});
