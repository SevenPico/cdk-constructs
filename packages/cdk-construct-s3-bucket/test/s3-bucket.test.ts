import { App, Stack } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { makeContext, Context } from '@sevenpico/cdk-context';
import { loadFeature, defineFeature } from 'jest-cucumber';
import path from 'path';
import { S3Bucket } from '../src/s3-bucket';
import { S3BucketProps } from '../src/s3-bucket-types';

const feature = loadFeature(path.join(__dirname, 's3-bucket.feature'));

const makeStack = (): Stack => {
  const app = new App();
  return new Stack(app, 'TestStack');
};

defineFeature(feature, (test: any) => {
  let context: Context;
  let stack: Stack;
  let template: Template;
  let extraProps: Partial<S3BucketProps>;

  test('Bucket name uses context ID', ({ given, when, then }: any) => {
    given(/^a context with namespace "(.+)", stage "(.+)", name "(.+)"$/, (ns: string, stage: string, name: string) => {
      context = makeContext({ namespace: ns, stage, name });
      extraProps = {};
    });
    when('an S3Bucket construct is created', () => {
      stack = makeStack();
      new S3Bucket(stack, 'SUT', { context, ...extraProps } as S3BucketProps);
      template = Template.fromStack(stack);
    });
    then(/^the S3 bucket name is "(.+)"$/, (bucketName: string) => {
      template.hasResourceProperties('AWS::S3::Bucket', {
        BucketName: bucketName,
      });
    });
  });

  test('Versioning enabled by default', ({ given, when, then }: any) => {
    given('a default context', () => {
      context = makeContext({ namespace: '7p', stage: 'prod', name: 'assets' });
      extraProps = {};
    });
    when('an S3Bucket construct is created', () => {
      stack = makeStack();
      new S3Bucket(stack, 'SUT', { context, ...extraProps } as S3BucketProps);
      template = Template.fromStack(stack);
    });
    then('the bucket has versioning enabled', () => {
      template.hasResourceProperties('AWS::S3::Bucket', {
        VersioningConfiguration: { Status: 'Enabled' },
      });
    });
  });

  test('SSE-S3 encryption applied by default', ({ given, when, then }: any) => {
    given('a default context', () => {
      context = makeContext({ namespace: '7p', stage: 'prod', name: 'assets' });
      extraProps = {};
    });
    when('an S3Bucket construct is created', () => {
      stack = makeStack();
      new S3Bucket(stack, 'SUT', { context, ...extraProps } as S3BucketProps);
      template = Template.fromStack(stack);
    });
    then('the bucket uses SSE-S3 server-side encryption', () => {
      template.hasResourceProperties('AWS::S3::Bucket', {
        BucketEncryption: {
          ServerSideEncryptionConfiguration: Match.arrayWith([
            Match.objectLike({
              ServerSideEncryptionByDefault: {
                SSEAlgorithm: 'AES256',
              },
            }),
          ]),
        },
      });
    });
  });

  test('KMS encryption when kmsKeyArn provided', ({ given, when, then }: any) => {
    given(/^a default context with kmsKeyArn "(.+)"$/, (keyArn: string) => {
      context = makeContext({ namespace: '7p', stage: 'prod', name: 'assets' });
      extraProps = { kmsKeyArn: keyArn };
    });
    when('an S3Bucket construct is created', () => {
      stack = makeStack();
      new S3Bucket(stack, 'SUT', { context, ...extraProps } as S3BucketProps);
      template = Template.fromStack(stack);
    });
    then('the bucket uses KMS encryption', () => {
      template.hasResourceProperties('AWS::S3::Bucket', {
        BucketEncryption: {
          ServerSideEncryptionConfiguration: Match.arrayWith([
            Match.objectLike({
              ServerSideEncryptionByDefault: {
                SSEAlgorithm: 'aws:kms',
              },
            }),
          ]),
        },
      });
    });
  });

  test('All public access blocked by default', ({ given, when, then }: any) => {
    given('a default context', () => {
      context = makeContext({ namespace: '7p', stage: 'prod', name: 'assets' });
      extraProps = {};
    });
    when('an S3Bucket construct is created', () => {
      stack = makeStack();
      new S3Bucket(stack, 'SUT', { context, ...extraProps } as S3BucketProps);
      template = Template.fromStack(stack);
    });
    then('all four public access block settings are enabled', () => {
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

  test('Context tags applied to bucket', ({ given, when, then }: any) => {
    given(/^a context with tags Env "(.+)"$/, (envTag: string) => {
      context = makeContext({ namespace: '7p', stage: 'prod', name: 'assets', tags: { Env: envTag } });
      extraProps = {};
    });
    when('an S3Bucket construct is created', () => {
      stack = makeStack();
      new S3Bucket(stack, 'SUT', { context, ...extraProps } as S3BucketProps);
      template = Template.fromStack(stack);
    });
    then(/^the S3 bucket resource has the tag Env "(.+)"$/, (envTag: string) => {
      template.hasResourceProperties('AWS::S3::Bucket', {
        Tags: Match.arrayWith([
          Match.objectLike({ Key: 'Env', Value: envTag }),
        ]),
      });
    });
  });

  test('No resources created when context is disabled', ({ given, when, then }: any) => {
    given('a context with enabled false', () => {
      context = makeContext({ namespace: '7p', stage: 'test', name: 'test', enabled: false });
      extraProps = {};
    });
    when('an S3Bucket construct is created', () => {
      stack = makeStack();
      new S3Bucket(stack, 'SUT', { context, ...extraProps } as S3BucketProps);
      template = Template.fromStack(stack);
    });
    then('no S3 Bucket resources exist in the stack', () => {
      template.resourceCountIs('AWS::S3::Bucket', 0);
    });
  });
});
