import { App, Stack } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { makeContext, Context } from '@sevenpico/cdk-context';
import { loadFeature, defineFeature } from 'jest-cucumber';
import path from 'path';
import { KmsKey } from '../src/kms-key';

const feature = loadFeature(path.join(__dirname, 'kms-key.feature'));

const makeStack = (): Stack => {
  const app = new App();
  return new Stack(app, 'TestStack');
};

defineFeature(feature, test => {
  let context: Context;
  let stack: Stack;
  let template: Template;

  test('Alias defaults to context ID', ({ given, when, then }) => {
    given(/^a context with namespace "(.+)", stage "(.+)", name "(.+)"$/, (ns, stage, name) => {
      context = makeContext({ namespace: ns, stage, name });
    });
    when('a KmsKey construct is created with no alias prop', () => {
      stack = makeStack();
      new KmsKey(stack, 'SUT', { context });
      template = Template.fromStack(stack);
    });
    then(/^a KMS alias "(.+)" exists$/, (aliasName) => {
      template.hasResourceProperties('AWS::KMS::Alias', {
        AliasName: aliasName,
      });
    });
  });

  test('Custom alias overrides default', ({ given, when, then }) => {
    given(/^a context with namespace "(.+)", stage "(.+)", name "(.+)"$/, (ns, stage, name) => {
      context = makeContext({ namespace: ns, stage, name });
    });
    when(/^a KmsKey construct is created with alias "(.+)"$/, (alias) => {
      stack = makeStack();
      new KmsKey(stack, 'SUT', { context, alias });
      template = Template.fromStack(stack);
    });
    then(/^a KMS alias "(.+)" exists$/, (aliasName) => {
      template.hasResourceProperties('AWS::KMS::Alias', {
        AliasName: aliasName,
      });
    });
  });

  test('Key rotation enabled by default', ({ given, when, then }) => {
    given(/^a context with namespace "(.+)", stage "(.+)", name "(.+)"$/, (ns, stage, name) => {
      context = makeContext({ namespace: ns, stage, name });
    });
    when('a KmsKey construct is created with defaults', () => {
      stack = makeStack();
      new KmsKey(stack, 'SUT', { context });
      template = Template.fromStack(stack);
    });
    then('the KMS key has key rotation enabled', () => {
      template.hasResourceProperties('AWS::KMS::Key', {
        EnableKeyRotation: true,
      });
    });
  });

  test('Pending window defaults to 10 days', ({ given, when, then }) => {
    given(/^a context with namespace "(.+)", stage "(.+)", name "(.+)"$/, (ns, stage, name) => {
      context = makeContext({ namespace: ns, stage, name });
    });
    when('a KmsKey construct is created with defaults', () => {
      stack = makeStack();
      new KmsKey(stack, 'SUT', { context });
      template = Template.fromStack(stack);
    });
    then('the pending deletion window is 10 days', () => {
      template.hasResourceProperties('AWS::KMS::Key', {
        PendingWindowInDays: 10,
      });
    });
  });

  test('Removal policy is RETAIN', ({ given, when, then }) => {
    given(/^a context with namespace "(.+)", stage "(.+)", name "(.+)"$/, (ns, stage, name) => {
      context = makeContext({ namespace: ns, stage, name });
    });
    when('a KmsKey construct is created with defaults', () => {
      stack = makeStack();
      new KmsKey(stack, 'SUT', { context });
      template = Template.fromStack(stack);
    });
    then('the KMS key has DeletionPolicy Retain', () => {
      const resources = template.toJSON().Resources;
      const keyResource = Object.values(resources).find(
        (r: any) => (r as any).Type === 'AWS::KMS::Key',
      ) as any;
      expect(keyResource.DeletionPolicy).toBe('Retain');
    });
  });

  test('Context tags applied to key', ({ given, when, then }) => {
    given(/^a context with namespace "(.+)", stage "(.+)", name "(.+)" and tags Env "(.+)"$/, (ns, stage, name, envTag) => {
      context = makeContext({ namespace: ns, stage, name, tags: { Env: envTag } });
    });
    when('a KmsKey construct is created', () => {
      stack = makeStack();
      new KmsKey(stack, 'SUT', { context });
      template = Template.fromStack(stack);
    });
    then(/^the KMS key resource has the tag Env "(.+)"$/, (envTag) => {
      template.hasResourceProperties('AWS::KMS::Key', {
        Tags: Match.arrayWith([
          Match.objectLike({ Key: 'Env', Value: envTag }),
        ]),
      });
    });
  });

  test('No resources created when context is disabled', ({ given, when, then, and }) => {
    given('a context with enabled false', () => {
      context = makeContext({ namespace: '7p', stage: 'test', name: 'test', enabled: false });
    });
    when('a KmsKey construct is created', () => {
      stack = makeStack();
      new KmsKey(stack, 'SUT', { context });
      template = Template.fromStack(stack);
    });
    then('no KMS Key resources exist in the stack', () => {
      template.resourceCountIs('AWS::KMS::Key', 0);
    });
    and('no KMS Alias resources exist in the stack', () => {
      template.resourceCountIs('AWS::KMS::Alias', 0);
    });
  });
});
