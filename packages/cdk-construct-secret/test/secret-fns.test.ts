import { makeContext } from '@sevenpico/cdk-context';
import {
  secretContext,
  kmsKeyContext,
  secretKmsKeyProps,
  smSecretProps,
  mapPrincipal,
  secretReadPolicyStatements,
} from '../src/secret-fns';
import { SecretProps } from '../src/secret-types';

describe('Secret pure functions', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'db-password' });
  const baseProps: SecretProps = { context: ctx };

  describe('secretContext', () => {
    test('appends "secret" attribute by default', () => {
      const sCtx = secretContext(ctx, baseProps);
      expect(sCtx.id).toBe('7p-prod-db-password-secret');
    });

    test('uses custom attributes when provided', () => {
      const sCtx = secretContext(ctx, { ...baseProps, secretAttributesOverride: ['creds'] });
      expect(sCtx.id).toBe('7p-prod-db-password-creds');
    });
  });

  describe('kmsKeyContext', () => {
    test('appends "key" attribute by default', () => {
      const kCtx = kmsKeyContext(ctx, baseProps);
      expect(kCtx.id).toBe('7p-prod-db-password-key');
    });

    test('uses custom attributes when provided', () => {
      const kCtx = kmsKeyContext(ctx, { ...baseProps, kmsKeyAttributesOverride: ['cmk'] });
      expect(kCtx.id).toBe('7p-prod-db-password-cmk');
    });
  });

  describe('secretKmsKeyProps', () => {
    test('defaults enableKeyRotation to true', () => {
      const kCtx = kmsKeyContext(ctx, baseProps);
      const result = secretKmsKeyProps(kCtx, baseProps);
      expect(result.enableKeyRotation).toBe(true);
    });

    test('description references context id', () => {
      const kCtx = kmsKeyContext(ctx, baseProps);
      const result = secretKmsKeyProps(kCtx, baseProps);
      expect(result.description).toBe('KMS key for secret 7p-prod-db-password-key');
    });

    test('uses custom deletion window', () => {
      const kCtx = kmsKeyContext(ctx, baseProps);
      const result = secretKmsKeyProps(kCtx, { ...baseProps, kmsKeyDeletionWindowInDays: 7 });
      expect(result.pendingWindow!.toDays()).toBe(7);
    });
  });

  describe('smSecretProps', () => {
    test('secretName uses context id', () => {
      const sCtx = secretContext(ctx, baseProps);
      const result = smSecretProps(sCtx, baseProps);
      expect(result.secretName).toBe('7p-prod-db-password-secret');
    });

    test('description is passed through', () => {
      const sCtx = secretContext(ctx, baseProps);
      const result = smSecretProps(sCtx, { ...baseProps, description: 'Database credentials' });
      expect(result.description).toBe('Database credentials');
    });

    test('replicaRegions defaults to empty', () => {
      const sCtx = secretContext(ctx, baseProps);
      const result = smSecretProps(sCtx, baseProps);
      expect(result.replicaRegions).toEqual([]);
    });

    test('replicaRegions maps region strings', () => {
      const sCtx = secretContext(ctx, baseProps);
      const result = smSecretProps(sCtx, { ...baseProps, replicaRegions: ['us-west-2', 'eu-west-1'] });
      expect(result.replicaRegions).toEqual([
        { region: 'us-west-2' },
        { region: 'eu-west-1' },
      ]);
    });

    test('secretStringValue is set when secretString provided', () => {
      const sCtx = secretContext(ctx, baseProps);
      const result = smSecretProps(sCtx, { ...baseProps, secretString: 'my-secret' });
      expect(result.secretStringValue).toBeDefined();
    });

    test('secretStringValue is undefined when no secretString', () => {
      const sCtx = secretContext(ctx, baseProps);
      const result = smSecretProps(sCtx, baseProps);
      expect(result.secretStringValue).toBeUndefined();
    });
  });

  describe('mapPrincipal', () => {
    test('maps AWS type to ArnPrincipal', () => {
      const principal = mapPrincipal({ type: 'AWS', identifiers: ['arn:aws:iam::123456789012:root'] });
      expect(principal).toBeDefined();
    });

    test('maps Service type to ServicePrincipal', () => {
      const principal = mapPrincipal({ type: 'Service', identifiers: ['lambda.amazonaws.com'] });
      expect(principal).toBeDefined();
    });
  });

  describe('secretReadPolicyStatements', () => {
    test('returns empty for no principals', () => {
      const stmts = secretReadPolicyStatements('arn:secret', 'arn:key', []);
      expect(stmts).toHaveLength(0);
    });

    test('returns secret statement and kms statement when key exists', () => {
      const stmts = secretReadPolicyStatements(
        'arn:aws:secretsmanager:us-east-1:123:secret:test',
        'arn:aws:kms:us-east-1:123:key/test',
        [{ type: 'AWS', identifiers: ['arn:aws:iam::123:root'] }],
      );
      expect(stmts).toHaveLength(2);
    });

    test('returns only secret statement when no key', () => {
      const stmts = secretReadPolicyStatements(
        'arn:aws:secretsmanager:us-east-1:123:secret:test',
        undefined,
        [{ type: 'AWS', identifiers: ['arn:aws:iam::123:root'] }],
      );
      expect(stmts).toHaveLength(1);
    });
  });
});
