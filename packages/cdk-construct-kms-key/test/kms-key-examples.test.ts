import { makeContext } from '@sevenpico/cdk-context';
import { App, Stack } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { KmsKey } from '../src/kms-key';

// Shared context matching examples/*/cdk.json
const CONTEXT = makeContext({ namespace: 'acme', environment: 'dev', stage: 'app' });

function makeStack(): Stack {
  const app = new App();
  return new Stack(app, 'TestStack');
}

// ---------------------------------------------------------------------------
// Example scenario: minimal
// ---------------------------------------------------------------------------

describe('Example: minimal', () => {
  let template: Template;

  beforeAll(() => {
    const stack = makeStack();
    new KmsKey(stack, 'Key', { context: CONTEXT });
    template = Template.fromStack(stack);
  });

  test('creates exactly 1 KMS key', () => {
    template.resourceCountIs('AWS::KMS::Key', 1);
  });

  test('creates exactly 1 KMS alias', () => {
    template.resourceCountIs('AWS::KMS::Alias', 1);
  });

  test('alias defaults to alias/{context.id}', () => {
    template.hasResourceProperties('AWS::KMS::Alias', {
      AliasName: 'alias/acme-dev-app',
    });
  });

  test('key rotation is enabled by default', () => {
    template.hasResourceProperties('AWS::KMS::Key', {
      EnableKeyRotation: true,
    });
  });

  test('pending window defaults to 10 days', () => {
    template.hasResourceProperties('AWS::KMS::Key', {
      PendingWindowInDays: 10,
    });
  });

  test('key spec defaults to SYMMETRIC_DEFAULT', () => {
    template.hasResourceProperties('AWS::KMS::Key', {
      KeySpec: 'SYMMETRIC_DEFAULT',
    });
  });

  test('key usage defaults to ENCRYPT_DECRYPT', () => {
    template.hasResourceProperties('AWS::KMS::Key', {
      KeyUsage: 'ENCRYPT_DECRYPT',
    });
  });

  test('description defaults to context id', () => {
    template.hasResourceProperties('AWS::KMS::Key', {
      Description: 'acme-dev-app',
    });
  });

  test('key has DeletionPolicy Retain', () => {
    const resources = template.toJSON().Resources;
    const keyResource = Object.values(resources).find(
      (r: any) => (r as any).Type === 'AWS::KMS::Key',
    ) as any;
    expect(keyResource.DeletionPolicy).toBe('Retain');
  });

  test('context tags applied to key', () => {
    template.hasResourceProperties('AWS::KMS::Key', {
      Tags: Match.arrayWith([
        Match.objectLike({ Key: 'Name', Value: 'acme-dev-app' }),
      ]),
    });
  });
});

// ---------------------------------------------------------------------------
// Example scenario: comprehensive
// ---------------------------------------------------------------------------

describe('Example: comprehensive', () => {
  let template: Template;

  const policy = JSON.stringify({
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Principal: { AWS: 'arn:aws:iam::123456789012:root' },
        Action: 'kms:*',
        Resource: '*',
      },
    ],
  });

  beforeAll(() => {
    const stack = makeStack();
    new KmsKey(stack, 'Key', {
      context: CONTEXT,
      alias: 'alias/acme-dev-app-custom',
      description: 'Comprehensive KMS key example — all props exercised',
      enableKeyRotation: false,
      pendingWindowInDays: 14,
      multiRegion: true,
      policy,
    });
    template = Template.fromStack(stack);
  });

  test('creates exactly 1 KMS key', () => {
    template.resourceCountIs('AWS::KMS::Key', 1);
  });

  test('custom alias is applied', () => {
    template.hasResourceProperties('AWS::KMS::Alias', {
      AliasName: 'alias/acme-dev-app-custom',
    });
  });

  test('key rotation is disabled', () => {
    template.hasResourceProperties('AWS::KMS::Key', {
      EnableKeyRotation: false,
    });
  });

  test('pending window is 14 days', () => {
    template.hasResourceProperties('AWS::KMS::Key', {
      PendingWindowInDays: 14,
    });
  });

  test('multi-region is enabled', () => {
    template.hasResourceProperties('AWS::KMS::Key', {
      MultiRegion: true,
    });
  });

  test('custom description is applied', () => {
    template.hasResourceProperties('AWS::KMS::Key', {
      Description: 'Comprehensive KMS key example — all props exercised',
    });
  });

  test('custom key policy is applied', () => {
    template.hasResourceProperties('AWS::KMS::Key', {
      KeyPolicy: Match.objectLike({
        Statement: Match.arrayWith([
          Match.objectLike({ Effect: 'Allow', Action: 'kms:*' }),
        ]),
      }),
    });
  });
});

// ---------------------------------------------------------------------------
// Example scenario: asymmetric (RSA_2048 / SIGN_VERIFY)
// ---------------------------------------------------------------------------

describe('Example: asymmetric', () => {
  let template: Template;

  beforeAll(() => {
    const stack = makeStack();
    new KmsKey(stack, 'Key', {
      context: CONTEXT,
      keySpec: 'RSA_2048',
      keyUsage: 'SIGN_VERIFY',
      enableKeyRotation: false,
      alias: 'alias/acme-dev-app-signing',
      description: 'Asymmetric RSA signing key',
    });
    template = Template.fromStack(stack);
  });

  test('creates exactly 1 KMS key', () => {
    template.resourceCountIs('AWS::KMS::Key', 1);
  });

  test('key spec is RSA_2048', () => {
    template.hasResourceProperties('AWS::KMS::Key', {
      KeySpec: 'RSA_2048',
    });
  });

  test('key usage is SIGN_VERIFY', () => {
    template.hasResourceProperties('AWS::KMS::Key', {
      KeyUsage: 'SIGN_VERIFY',
    });
  });

  test('key rotation is disabled', () => {
    template.hasResourceProperties('AWS::KMS::Key', {
      EnableKeyRotation: false,
    });
  });

  test('alias is alias/acme-dev-app-signing', () => {
    template.hasResourceProperties('AWS::KMS::Alias', {
      AliasName: 'alias/acme-dev-app-signing',
    });
  });
});

// ---------------------------------------------------------------------------
// Example scenario: symmetric-hmac (HMAC_256 / GENERATE_VERIFY_MAC)
// ---------------------------------------------------------------------------

describe('Example: symmetric-hmac', () => {
  let template: Template;

  beforeAll(() => {
    const stack = makeStack();
    new KmsKey(stack, 'Key', {
      context: CONTEXT,
      keySpec: 'HMAC_256',
      keyUsage: 'GENERATE_VERIFY_MAC',
      enableKeyRotation: false,
      alias: 'alias/acme-dev-app-hmac',
      description: 'HMAC-256 key for MAC generation and verification',
    });
    template = Template.fromStack(stack);
  });

  test('creates exactly 1 KMS key', () => {
    template.resourceCountIs('AWS::KMS::Key', 1);
  });

  test('key spec is HMAC_256', () => {
    template.hasResourceProperties('AWS::KMS::Key', {
      KeySpec: 'HMAC_256',
    });
  });

  test('key usage is GENERATE_VERIFY_MAC', () => {
    template.hasResourceProperties('AWS::KMS::Key', {
      KeyUsage: 'GENERATE_VERIFY_MAC',
    });
  });

  test('key rotation is disabled', () => {
    template.hasResourceProperties('AWS::KMS::Key', {
      EnableKeyRotation: false,
    });
  });

  test('alias is alias/acme-dev-app-hmac', () => {
    template.hasResourceProperties('AWS::KMS::Alias', {
      AliasName: 'alias/acme-dev-app-hmac',
    });
  });
});
