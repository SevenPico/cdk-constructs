import path from 'path';
import { makeContext, Context } from '@sevenpico/cdk-context';
import { App, Stack } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { loadFeature, defineFeature } from 'jest-cucumber';
import { Secret } from '../src/secret';
import { SecretProps } from '../src/secret-types';

const feature = loadFeature(path.join(__dirname, 'secret.feature'));

const makeStack = (): Stack => {
  const app = new App();
  return new Stack(app, 'TestStack');
};

defineFeature(feature, test => {
  let context: Context;
  let stack: Stack;
  let template: Template;
  let props: SecretProps;

  test('Secret name uses context ID with secret suffix', ({ given, when, then }) => {
    given(/^a context with namespace "(.+)", stage "(.+)", name "(.+)"$/, (ns, stage, name) => {
      context = makeContext({ namespace: ns, stage, name });
    });
    when('a Secret construct is created', () => {
      stack = makeStack();
      props = { context };
      new Secret(stack, 'SUT', props);
      template = Template.fromStack(stack);
    });
    then(/^an AWS SecretsManager Secret resource exists with name "(.+)"$/, (secretName) => {
      template.hasResourceProperties('AWS::SecretsManager::Secret', {
        Name: secretName,
      });
    });
  });

  test('KMS key created by default', ({ given, when, then, and }) => {
    given(/^a context with namespace "(.+)", stage "(.+)", name "(.+)"$/, (ns, stage, name) => {
      context = makeContext({ namespace: ns, stage, name });
    });
    when('a Secret construct is created with defaults', () => {
      stack = makeStack();
      props = { context };
      new Secret(stack, 'SUT', props);
      template = Template.fromStack(stack);
    });
    then('a KMS Key resource exists', () => {
      template.resourceCountIs('AWS::KMS::Key', 1);
    });
    and(/^a KMS Alias "(.+)" exists$/, (aliasName) => {
      template.hasResourceProperties('AWS::KMS::Alias', {
        AliasName: aliasName,
      });
    });
  });

  test('Secret encrypted with provided KMS key ARN', ({ given, when, then, and }) => {
    given(/^a context with namespace "(.+)", stage "(.+)", name "(.+)"$/, (ns, stage, name) => {
      context = makeContext({ namespace: ns, stage, name });
    });
    when(/^a Secret construct is created with createKmsKey false and kmsKeyArn "(.+)"$/, (keyArn) => {
      stack = makeStack();
      props = { context, createKmsKey: false, kmsKeyArn: keyArn };
      new Secret(stack, 'SUT', props);
      template = Template.fromStack(stack);
    });
    then('the secret is encrypted with the specified KMS key ARN', () => {
      template.hasResourceProperties('AWS::SecretsManager::Secret', {
        KmsKeyId: Match.anyValue(),
      });
    });
    and('no KMS Key resources are created', () => {
      template.resourceCountIs('AWS::KMS::Key', 0);
    });
  });

  test('Initial secret string provided', ({ given, when, then }) => {
    given(/^a context with namespace "(.+)", stage "(.+)", name "(.+)"$/, (ns, stage, name) => {
      context = makeContext({ namespace: ns, stage, name });
    });
    when(/^a Secret construct is created with secretString "(.+)"$/, (secretStr) => {
      stack = makeStack();
      props = { context, secretString: secretStr };
      new Secret(stack, 'SUT', props);
      template = Template.fromStack(stack);
    });
    then('the secret resource has a SecretString configured', () => {
      template.hasResourceProperties('AWS::SecretsManager::Secret', {
        SecretString: Match.anyValue(),
      });
    });
  });

  test('Context tags applied to secret', ({ given, when, then }) => {
    given(/^a context with namespace "(.+)", stage "(.+)", name "(.+)" and tags Env "(.+)"$/, (ns, stage, name, envTag) => {
      context = makeContext({ namespace: ns, stage, name, tags: { Env: envTag } });
    });
    when('a Secret construct is created', () => {
      stack = makeStack();
      props = { context };
      new Secret(stack, 'SUT', props);
      template = Template.fromStack(stack);
    });
    then(/^the secret resource has the tag Env "(.+)"$/, (envTag) => {
      template.hasResourceProperties('AWS::SecretsManager::Secret', {
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
    when('a Secret construct is created', () => {
      stack = makeStack();
      props = { context };
      new Secret(stack, 'SUT', props);
      template = Template.fromStack(stack);
    });
    then('no SecretsManager Secret resources exist in the stack', () => {
      template.resourceCountIs('AWS::SecretsManager::Secret', 0);
    });
    and('no KMS Key resources exist in the stack', () => {
      template.resourceCountIs('AWS::KMS::Key', 0);
    });
  });
});
