/**
 * Assertion tests for s3-log-storage examples.
 *
 * These tests synthesize the example stacks in-process using the fixture context
 * from examples/fixtures/bridge.cdk.json and assert that the correct CloudFormation
 * resources are produced. They serve as runnable validation for every language
 * example (all language examples express the same intent as the TypeScript app).
 */
import { App, Stack } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { makeContext } from '@sevenpico/cdk-context';
import { S3LogStorage } from '../src/s3-log-storage';

// Fixture values matching examples/fixtures/bridge.cdk.json
const FIXTURE_CONTEXT = makeContext({
  namespace: 'acme',
  environment: 'dev',
  stage: 'app',
  tags: { Owner: 'platform-team', CostCenter: 'engineering' },
});

const DISABLED_CONTEXT = makeContext({
  namespace: 'acme',
  environment: 'dev',
  stage: 'app',
  enabled: false,
  tags: { Owner: 'platform-team' },
});

const LOG_KMS_KEY_ARN = 'arn:aws:kms:us-east-1:123456789012:key/bbbbbbbb-cccc-dddd-eeee-ffffffffffff';
const LOGS_BUCKET_NAME = 'acme-dev-app-logs-123456789012';

const makeStack = (): Stack => {
  const app = new App();
  return new Stack(app, 'TestStack');
};

// ---------------------------------------------------------------------------
// minimal example
// ---------------------------------------------------------------------------

describe('Example: minimal', () => {
  let template: Template;

  beforeAll(() => {
    const stack = makeStack();
    new S3LogStorage(stack, 'LogStorage', {
      context: FIXTURE_CONTEXT,
    });
    template = Template.fromStack(stack);
  });

  test('creates exactly one S3 bucket', () => {
    template.resourceCountIs('AWS::S3::Bucket', 1);
  });

  test('bucket name is derived from context id', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      BucketName: 'acme-dev-app',
    });
  });

  test('versioning is enabled by default', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      VersioningConfiguration: { Status: 'Enabled' },
    });
  });

  test('AES256 encryption is the default', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      BucketEncryption: Match.objectLike({
        ServerSideEncryptionConfiguration: Match.arrayWith([
          Match.objectLike({
            ServerSideEncryptionByDefault: { SSEAlgorithm: 'AES256' },
          }),
        ]),
      }),
    });
  });

  test('all public access blocks enabled by default', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
    });
  });

  test('SSL-only bucket policy applied by default', () => {
    template.hasResourceProperties('AWS::S3::BucketPolicy', {
      PolicyDocument: Match.objectLike({
        Statement: Match.arrayWith([
          Match.objectLike({
            Sid: 'AllowSSLRequestsOnly',
            Effect: 'Deny',
            Condition: { Bool: { 'aws:SecureTransport': 'false' } },
          }),
        ]),
      }),
    });
  });

  test('object ownership defaults to ObjectWriter', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      OwnershipControls: {
        Rules: [{ ObjectOwnership: 'ObjectWriter' }],
      },
    });
  });

  test('no SQS queue created by default', () => {
    template.resourceCountIs('AWS::SQS::Queue', 0);
  });

  test('context tags are applied', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      Tags: Match.arrayWith([
        Match.objectLike({ Key: 'Owner', Value: 'platform-team' }),
      ]),
    });
  });
});

// ---------------------------------------------------------------------------
// comprehensive example
// ---------------------------------------------------------------------------

describe('Example: comprehensive', () => {
  let template: Template;

  beforeAll(() => {
    const stack = makeStack();
    new S3LogStorage(stack, 'LogStorage', {
      context: FIXTURE_CONTEXT,
      sseAlgorithm: 'aws:kms',
      kmsKeyArn: LOG_KMS_KEY_ARN,
      bucketKeyEnabled: true,
      accessLogBucketName: LOGS_BUCKET_NAME,
      accessLogPrefix: 'acme-dev-app-logs/',
      notificationsEnabled: true,
      notificationsType: 'SQS',
      notificationsPrefix: 'raw/',
      lifecycleRules: [
        {
          id: 'expire-old-logs',
          enabled: true,
          expirationDays: 365,
          noncurrentVersionExpirationDays: 30,
          transitions: [
            { storageClass: 'GLACIER', transitionAfterDays: 90 },
          ],
          abortIncompleteMultipartUploadAfterDays: 7,
        },
      ],
      blockPublicAcls: true,
      blockPublicPolicy: true,
      ignorePublicAcls: true,
      restrictPublicBuckets: true,
      allowSslRequestsOnly: true,
      versioningEnabled: true,
      objectOwnership: 'ObjectWriter',
    });
    template = Template.fromStack(stack);
  });

  test('creates exactly one S3 bucket', () => {
    template.resourceCountIs('AWS::S3::Bucket', 1);
  });

  test('KMS encryption is configured', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      BucketEncryption: Match.objectLike({
        ServerSideEncryptionConfiguration: Match.arrayWith([
          Match.objectLike({
            ServerSideEncryptionByDefault: {
              SSEAlgorithm: 'aws:kms',
              KMSMasterKeyID: LOG_KMS_KEY_ARN,
            },
            BucketKeyEnabled: true,
          }),
        ]),
      }),
    });
  });

  test('access logging is configured', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      LoggingConfiguration: {
        DestinationBucketName: LOGS_BUCKET_NAME,
        LogFilePrefix: 'acme-dev-app-logs/',
      },
    });
  });

  test('lifecycle rule expires objects after 365 days', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      LifecycleConfiguration: Match.objectLike({
        Rules: Match.arrayWith([
          Match.objectLike({
            Id: 'expire-old-logs',
            Status: 'Enabled',
            ExpirationInDays: 365,
          }),
        ]),
      }),
    });
  });

  test('lifecycle rule transitions to Glacier after 90 days', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      LifecycleConfiguration: Match.objectLike({
        Rules: Match.arrayWith([
          Match.objectLike({
            Transitions: Match.arrayWith([
              Match.objectLike({
                StorageClass: 'GLACIER',
                TransitionInDays: 90,
              }),
            ]),
          }),
        ]),
      }),
    });
  });

  test('SQS notification queue is created', () => {
    template.resourceCountIs('AWS::SQS::Queue', 1);
  });

  test('SQS queue name includes context id', () => {
    template.hasResourceProperties('AWS::SQS::Queue', {
      QueueName: 'acme-dev-app-notifications',
    });
  });

  test('versioning is enabled', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      VersioningConfiguration: { Status: 'Enabled' },
    });
  });

  test('SSL-only bucket policy is applied', () => {
    template.hasResourceProperties('AWS::S3::BucketPolicy', {
      PolicyDocument: Match.objectLike({
        Statement: Match.arrayWith([
          Match.objectLike({
            Sid: 'AllowSSLRequestsOnly',
            Effect: 'Deny',
          }),
        ]),
      }),
    });
  });

  test('context tags are applied', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      Tags: Match.arrayWith([
        Match.objectLike({ Key: 'Owner', Value: 'platform-team' }),
      ]),
    });
  });
});

// ---------------------------------------------------------------------------
// disabled example
// ---------------------------------------------------------------------------

describe('Example: disabled', () => {
  let template: Template;

  beforeAll(() => {
    const stack = makeStack();
    new S3LogStorage(stack, 'LogStorage', {
      context: DISABLED_CONTEXT,
      notificationsEnabled: true,
    });
    template = Template.fromStack(stack);
  });

  test('no S3 bucket is created when context is disabled', () => {
    template.resourceCountIs('AWS::S3::Bucket', 0);
  });

  test('no S3 bucket policy is created when context is disabled', () => {
    template.resourceCountIs('AWS::S3::BucketPolicy', 0);
  });

  test('no SQS queue is created when context is disabled', () => {
    template.resourceCountIs('AWS::SQS::Queue', 0);
  });
});
