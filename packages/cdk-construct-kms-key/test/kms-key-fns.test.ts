import { makeContext } from '@sevenpico/cdk-context';
import { RemovalPolicy, aws_kms as kms } from 'aws-cdk-lib';
import { kmsKeyProps, kmsAliasName } from '../src/kms-key-fns';

describe('kmsKeyProps', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'secrets' });

  test('description defaults to context id', () => {
    const props = kmsKeyProps(ctx, { context: ctx });
    expect(props.description).toBe('7p-prod-secrets');
  });

  test('custom description overrides default', () => {
    const props = kmsKeyProps(ctx, { context: ctx, description: 'My Key' });
    expect(props.description).toBe('My Key');
  });

  test('enableKeyRotation defaults to true', () => {
    const props = kmsKeyProps(ctx, { context: ctx });
    expect(props.enableKeyRotation).toBe(true);
  });

  test('enableKeyRotation can be set to false', () => {
    const props = kmsKeyProps(ctx, { context: ctx, enableKeyRotation: false });
    expect(props.enableKeyRotation).toBe(false);
  });

  test('keyUsage defaults to ENCRYPT_DECRYPT', () => {
    const props = kmsKeyProps(ctx, { context: ctx });
    expect(props.keyUsage).toBe(kms.KeyUsage.ENCRYPT_DECRYPT);
  });

  test('custom keyUsage overrides default', () => {
    const props = kmsKeyProps(ctx, { context: ctx, keyUsage: 'SIGN_VERIFY' });
    expect(props.keyUsage).toBe('SIGN_VERIFY');
  });

  test('keySpec defaults to SYMMETRIC_DEFAULT', () => {
    const props = kmsKeyProps(ctx, { context: ctx });
    expect(props.keySpec).toBe(kms.KeySpec.SYMMETRIC_DEFAULT);
  });

  test('custom keySpec overrides default', () => {
    const props = kmsKeyProps(ctx, { context: ctx, keySpec: 'RSA_2048' });
    expect(props.keySpec).toBe('RSA_2048');
  });

  test('removalPolicy is always RETAIN', () => {
    const props = kmsKeyProps(ctx, { context: ctx });
    expect(props.removalPolicy).toBe(RemovalPolicy.RETAIN);
  });

  test('policy is undefined when not provided', () => {
    const props = kmsKeyProps(ctx, { context: ctx });
    expect(props.policy).toBeUndefined();
  });

  test('policy is parsed from JSON when provided', () => {
    const policyJson = JSON.stringify({
      Version: '2012-10-17',
      Statement: [{ Effect: 'Allow', Principal: '*', Action: 'kms:*', Resource: '*' }],
    });
    const props = kmsKeyProps(ctx, { context: ctx, policy: policyJson });
    expect(props.policy).toBeDefined();
  });
});

describe('kmsAliasName', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'secrets' });

  test('defaults to alias/{context.id}', () => {
    expect(kmsAliasName(ctx, { context: ctx })).toBe('alias/7p-prod-secrets');
  });

  test('custom alias overrides default', () => {
    expect(kmsAliasName(ctx, { context: ctx, alias: 'alias/my-key' })).toBe('alias/my-key');
  });
});
