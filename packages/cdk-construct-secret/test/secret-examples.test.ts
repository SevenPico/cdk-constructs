import { makeContext } from '@sevenpico/cdk-context';
import { App, Stack } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { Secret } from '../src/secret';

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
    new Secret(stack, 'Secret', { context: CONTEXT });
    template = Template.fromStack(stack);
  });

  test('creates exactly 1 Secrets Manager secret', () => {
    template.resourceCountIs('AWS::SecretsManager::Secret', 1);
  });

  test('creates exactly 1 KMS key', () => {
    template.resourceCountIs('AWS::KMS::Key', 1);
  });

  test('creates exactly 1 KMS alias', () => {
    template.resourceCountIs('AWS::KMS::Alias', 1);
  });

  test('KMS key has rotation enabled by default', () => {
    template.hasResourceProperties('AWS::KMS::Key', {
      EnableKeyRotation: true,
    });
  });

  test('no SNS topic created', () => {
    template.resourceCountIs('AWS::SNS::Topic', 0);
  });
});

// ---------------------------------------------------------------------------
// Example scenario: with-sns
// ---------------------------------------------------------------------------

describe('Example: with-sns', () => {
  let template: Template;

  beforeAll(() => {
    const stack = makeStack();
    new Secret(stack, 'Secret', {
      context: CONTEXT,
      description: 'Application credentials with SNS notifications',
      createSns: true,
      secretReadPrincipals: [
        {
          type: 'AWS',
          identifiers: ['arn:aws:iam::123456789012:role/acme-app-role'],
        },
      ],
      snsPubPrincipals: [
        {
          type: 'Service',
          identifiers: ['secretsmanager.amazonaws.com'],
        },
      ],
      snsSubPrincipals: [
        {
          type: 'AWS',
          identifiers: ['arn:aws:iam::123456789012:role/acme-ops-role'],
        },
      ],
    });
    template = Template.fromStack(stack);
  });

  test('creates exactly 1 Secrets Manager secret', () => {
    template.resourceCountIs('AWS::SecretsManager::Secret', 1);
  });

  test('secret has description', () => {
    template.hasResourceProperties('AWS::SecretsManager::Secret', {
      Description: 'Application credentials with SNS notifications',
    });
  });

  test('creates exactly 1 SNS topic', () => {
    template.resourceCountIs('AWS::SNS::Topic', 1);
  });

  test('creates exactly 1 KMS key', () => {
    template.resourceCountIs('AWS::KMS::Key', 1);
  });

  test('secret has resource policy with read principal', () => {
    template.hasResourceProperties('AWS::SecretsManager::ResourcePolicy', {
      ResourcePolicy: Match.objectLike({
        Statement: Match.arrayWith([
          Match.objectLike({
            Effect: 'Allow',
            Principal: Match.objectLike({
              AWS: 'arn:aws:iam::123456789012:role/acme-app-role',
            }),
          }),
        ]),
      }),
    });
  });

  test('SNS topic policy allows publish from secretsmanager', () => {
    template.hasResourceProperties('AWS::SNS::TopicPolicy', {
      PolicyDocument: Match.objectLike({
        Statement: Match.arrayWith([
          Match.objectLike({
            Effect: 'Allow',
            Principal: Match.objectLike({
              Service: 'secretsmanager.amazonaws.com',
            }),
          }),
        ]),
      }),
    });
  });
});

// ---------------------------------------------------------------------------
// Example scenario: disabled
// ---------------------------------------------------------------------------

describe('Example: disabled', () => {
  let template: Template;

  beforeAll(() => {
    const stack = makeStack();
    new Secret(stack, 'Secret', {
      context: makeContext({ namespace: 'acme', environment: 'dev', stage: 'app', enabled: false }),
    });
    template = Template.fromStack(stack);
  });

  test('creates no resources when disabled', () => {
    const resources = template.toJSON().Resources ?? {};
    expect(Object.keys(resources)).toHaveLength(0);
  });

  test('creates no secrets', () => {
    template.resourceCountIs('AWS::SecretsManager::Secret', 0);
  });

  test('creates no KMS keys', () => {
    template.resourceCountIs('AWS::KMS::Key', 0);
  });
});
