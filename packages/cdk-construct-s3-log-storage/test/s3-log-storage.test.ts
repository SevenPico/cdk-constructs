import { App, Stack } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { makeContext } from '@sevenpico/cdk-context';
import { S3LogStorage } from '../src/s3-log-storage';
import { S3LogStorageProps } from '../src/s3-log-storage-types';

const makeStack = (): Stack => {
  const app = new App();
  return new Stack(app, 'TestStack');
};

const baseProps = (overrides?: Partial<S3LogStorageProps>): S3LogStorageProps => ({
  context: makeContext({ namespace: '7p', stage: 'prod', name: 'logs' }),
  ...overrides,
});

describe('S3LogStorage construct', () => {
  describe('Feature: Bucket Naming', () => {
    test('Log bucket name uses context ID', () => {
      const stack = makeStack();
      new S3LogStorage(stack, 'SUT', baseProps());
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::S3::Bucket', {
        BucketName: '7p-prod-logs',
      });
    });
  });

  describe('Feature: Versioning', () => {
    test('Versioning is enabled by default', () => {
      const stack = makeStack();
      new S3LogStorage(stack, 'SUT', baseProps());
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::S3::Bucket', {
        VersioningConfiguration: { Status: 'Enabled' },
      });
    });
  });

  describe('Feature: SSL Enforcement', () => {
    test('SSL-only requests enforced by default', () => {
      const stack = makeStack();
      new S3LogStorage(stack, 'SUT', baseProps());
      const template = Template.fromStack(stack);
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
  });

  describe('Feature: Public Access Block', () => {
    test('All public access blocks enabled by default', () => {
      const stack = makeStack();
      new S3LogStorage(stack, 'SUT', baseProps());
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::S3::Bucket', {
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          BlockPublicPolicy: true,
          IgnorePublicAcls: true,
          RestrictPublicBuckets: true,
        },
      });
    });
  });

  describe('Feature: Tagging', () => {
    test('Context tags applied to log bucket', () => {
      const stack = makeStack();
      new S3LogStorage(stack, 'SUT', baseProps({
        context: makeContext({ namespace: '7p', stage: 'prod', name: 'logs', tags: { Env: 'production' } }),
      }));
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::S3::Bucket', {
        Tags: Match.arrayWith([
          Match.objectLike({ Key: 'Env', Value: 'production' }),
        ]),
      });
    });
  });

  describe('Feature: Disabled Construct', () => {
    test('No resources created when context is disabled', () => {
      const stack = makeStack();
      new S3LogStorage(stack, 'SUT', baseProps({
        context: makeContext({ namespace: '7p', stage: 'test', name: 'test', enabled: false }),
      }));
      const template = Template.fromStack(stack);
      template.resourceCountIs('AWS::S3::Bucket', 0);
    });
  });

  describe('Feature: SQS Notifications', () => {
    test('SQS queue created when notificationsEnabled is true', () => {
      const stack = makeStack();
      new S3LogStorage(stack, 'SUT', baseProps({ notificationsEnabled: true }));
      const template = Template.fromStack(stack);
      template.resourceCountIs('AWS::SQS::Queue', 1);
    });

    test('No SQS queue when notificationsEnabled is false', () => {
      const stack = makeStack();
      new S3LogStorage(stack, 'SUT', baseProps());
      const template = Template.fromStack(stack);
      template.resourceCountIs('AWS::SQS::Queue', 0);
    });

    test('No SQS queue when context is disabled', () => {
      const stack = makeStack();
      new S3LogStorage(stack, 'SUT', baseProps({
        context: makeContext({ namespace: '7p', stage: 'test', name: 'test', enabled: false }),
        notificationsEnabled: true,
      }));
      const template = Template.fromStack(stack);
      template.resourceCountIs('AWS::SQS::Queue', 0);
    });
  });

  describe('Feature: Object Ownership', () => {
    test('Object ownership defaults to ObjectWriter', () => {
      const stack = makeStack();
      new S3LogStorage(stack, 'SUT', baseProps());
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::S3::Bucket', {
        OwnershipControls: {
          Rules: [{ ObjectOwnership: 'ObjectWriter' }],
        },
      });
    });
  });
});
