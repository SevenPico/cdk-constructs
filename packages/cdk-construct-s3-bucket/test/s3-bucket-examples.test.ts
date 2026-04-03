import { App, Stack } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { makeContext } from '@sevenpico/cdk-context';
import { S3Bucket } from '../src/s3-bucket';

// Shared context matching examples/*/cdk.json
const CONTEXT = makeContext({ namespace: 'acme', environment: 'dev', stage: 'app' });
const KMS_KEY_ARN = 'arn:aws:kms:us-east-1:123456789012:key/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

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
    new S3Bucket(stack, 'Bucket', { context: CONTEXT });
    template = Template.fromStack(stack);
  });

  test('creates exactly 1 S3 bucket', () => {
    template.resourceCountIs('AWS::S3::Bucket', 1);
  });

  test('bucket name is derived from context', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      BucketName: 'acme-dev-app',
    });
  });

  test('versioning is enabled by default', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      VersioningConfiguration: { Status: 'Enabled' },
    });
  });

  test('S3-managed encryption by default', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      BucketEncryption: {
        ServerSideEncryptionConfiguration: Match.arrayWith([
          Match.objectLike({
            ServerSideEncryptionByDefault: { SSEAlgorithm: 'AES256' },
          }),
        ]),
      },
    });
  });

  test('all public access blocked by default', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
    });
  });

  test('bucket has DeletionPolicy Retain', () => {
    const resources = template.toJSON().Resources;
    const bucket = Object.values(resources).find(
      (r: any) => (r as any).Type === 'AWS::S3::Bucket',
    ) as any;
    expect(bucket.DeletionPolicy).toBe('Retain');
  });

  test('context tags applied to bucket', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
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

  beforeAll(() => {
    const stack = makeStack();
    new S3Bucket(stack, 'Bucket', {
      context: CONTEXT,
      versioningEnabled: true,
      transferAccelerationEnabled: true,
      objectOwnership: 'BucketOwnerEnforced',
      allowSslRequestsOnly: true,
      lifecycleRules: [
        {
          id: 'expire-old-versions',
          enabled: true,
          noncurrentVersionExpirationDays: 30,
          transitions: [
            { storageClass: 'STANDARD_IA', transitionAfterDays: 90 },
            { storageClass: 'GLACIER', transitionAfterDays: 365 },
          ],
          abortIncompleteMultipartUploadAfterDays: 7,
        },
      ],
      corsRules: [
        {
          allowedMethods: ['GET', 'PUT'],
          allowedOrigins: ['https://acme.example.com'],
          allowedHeaders: ['*'],
          maxAge: 3600,
        },
      ],
    });
    template = Template.fromStack(stack);
  });

  test('creates exactly 1 S3 bucket', () => {
    template.resourceCountIs('AWS::S3::Bucket', 1);
  });

  test('versioning is enabled', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      VersioningConfiguration: { Status: 'Enabled' },
    });
  });

  test('transfer acceleration is enabled', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      AccelerateConfiguration: { AccelerationStatus: 'Enabled' },
    });
  });

  test('object ownership is BucketOwnerEnforced', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      OwnershipControls: {
        Rules: Match.arrayWith([
          Match.objectLike({ ObjectOwnership: 'BucketOwnerEnforced' }),
        ]),
      },
    });
  });

  test('lifecycle rule with noncurrent version expiry is configured', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      LifecycleConfiguration: {
        Rules: Match.arrayWith([
          Match.objectLike({
            Id: 'expire-old-versions',
            Status: 'Enabled',
            NoncurrentVersionExpiration: { NoncurrentDays: 30 },
          }),
        ]),
      },
    });
  });

  test('CORS rule is configured', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      CorsConfiguration: {
        CorsRules: Match.arrayWith([
          Match.objectLike({
            AllowedMethods: Match.arrayWith(['GET', 'PUT']),
            AllowedOrigins: ['https://acme.example.com'],
          }),
        ]),
      },
    });
  });

  test('SSL-only bucket policy is attached', () => {
    template.hasResourceProperties('AWS::S3::BucketPolicy', {
      PolicyDocument: Match.objectLike({
        Statement: Match.arrayWith([
          Match.objectLike({ Sid: 'AllowSSLRequestsOnly', Effect: 'Deny' }),
        ]),
      }),
    });
  });
});

// ---------------------------------------------------------------------------
// Example scenario: kms-encrypted
// ---------------------------------------------------------------------------

describe('Example: kms-encrypted', () => {
  let template: Template;

  beforeAll(() => {
    const stack = makeStack();
    new S3Bucket(stack, 'Bucket', {
      context: CONTEXT,
      sseAlgorithm: 'aws:kms',
      kmsKeyArn: KMS_KEY_ARN,
      bucketKeyEnabled: true,
      allowEncryptedUploadsOnly: true,
    });
    template = Template.fromStack(stack);
  });

  test('creates exactly 1 S3 bucket', () => {
    template.resourceCountIs('AWS::S3::Bucket', 1);
  });

  test('KMS encryption is configured', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      BucketEncryption: {
        ServerSideEncryptionConfiguration: Match.arrayWith([
          Match.objectLike({
            ServerSideEncryptionByDefault: { SSEAlgorithm: 'aws:kms' },
          }),
        ]),
      },
    });
  });

  test('bucket key is enabled', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      BucketEncryption: {
        ServerSideEncryptionConfiguration: Match.arrayWith([
          Match.objectLike({ BucketKeyEnabled: true }),
        ]),
      },
    });
  });

  test('encrypted-uploads-only policy is attached', () => {
    template.hasResourceProperties('AWS::S3::BucketPolicy', {
      PolicyDocument: Match.objectLike({
        Statement: Match.arrayWith([
          Match.objectLike({ Sid: 'DenyUnEncryptedObjectUploads', Effect: 'Deny' }),
        ]),
      }),
    });
  });
});

// ---------------------------------------------------------------------------
// Example scenario: s3-managed-encrypted
// ---------------------------------------------------------------------------

describe('Example: s3-managed-encrypted', () => {
  let template: Template;

  beforeAll(() => {
    const stack = makeStack();
    new S3Bucket(stack, 'Bucket', {
      context: CONTEXT,
      sseAlgorithm: 'AES256',
    });
    template = Template.fromStack(stack);
  });

  test('creates exactly 1 S3 bucket', () => {
    template.resourceCountIs('AWS::S3::Bucket', 1);
  });

  test('AES256 encryption is configured', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      BucketEncryption: {
        ServerSideEncryptionConfiguration: Match.arrayWith([
          Match.objectLike({
            ServerSideEncryptionByDefault: { SSEAlgorithm: 'AES256' },
          }),
        ]),
      },
    });
  });

  test('no KMS-related resources created', () => {
    template.resourceCountIs('AWS::KMS::Grant', 0);
  });
});

// ---------------------------------------------------------------------------
// Example scenario: disabled
// ---------------------------------------------------------------------------

describe('Example: disabled', () => {
  let template: Template;

  beforeAll(() => {
    const stack = makeStack();
    new S3Bucket(stack, 'Bucket', {
      context: makeContext({ namespace: 'acme', environment: 'dev', stage: 'app', enabled: false }),
    });
    template = Template.fromStack(stack);
  });

  test('creates no S3 buckets when disabled', () => {
    template.resourceCountIs('AWS::S3::Bucket', 0);
  });

  test('creates no KMS grants when disabled', () => {
    template.resourceCountIs('AWS::KMS::Grant', 0);
  });
});
