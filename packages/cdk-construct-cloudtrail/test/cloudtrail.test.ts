import { App, Stack } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { makeContext, Context } from '@sevenpico/cdk-context';
import { loadFeature, defineFeature } from 'jest-cucumber';
import path from 'path';
import { CloudTrail } from '../src/cloudtrail';
import { CloudtrailProps } from '../src/cloudtrail-types';

const feature = loadFeature(path.join(__dirname, 'cloudtrail.feature'));

const makeStack = (): Stack => {
  const app = new App();
  return new Stack(app, 'TestStack');
};

defineFeature(feature, (test: any) => {
  let context: Context;
  let stack: Stack;
  let template: Template;
  let extraProps: Partial<CloudtrailProps>;

  test('Trail created with context-based name', ({ given, when, then }: any) => {
    given(/^a context with namespace "(.+)", stage "(.+)", name "(.+)"$/, (ns: string, stage: string, name: string) => {
      context = makeContext({ namespace: ns, stage, name });
      extraProps = {};
    });
    when(/^a CloudTrail construct is created with s3BucketName "(.+)"$/, (bucket: string) => {
      stack = makeStack();
      new CloudTrail(stack, 'SUT', { context, s3BucketName: bucket, ...extraProps } as CloudtrailProps);
      template = Template.fromStack(stack);
    });
    then(/^an AWS::CloudTrail::Trail resource exists with TrailName "(.+)"$/, (trailName: string) => {
      template.hasResourceProperties('AWS::CloudTrail::Trail', {
        TrailName: trailName,
      });
    });
  });

  test('Multi-region trail enabled by default', ({ given, when, then }: any) => {
    given('a default context', () => {
      context = makeContext({ namespace: '7p', stage: 'prod', name: 'audit' });
      extraProps = {};
    });
    when(/^a CloudTrail construct is created with s3BucketName "(.+)"$/, (bucket: string) => {
      stack = makeStack();
      new CloudTrail(stack, 'SUT', { context, s3BucketName: bucket, ...extraProps } as CloudtrailProps);
      template = Template.fromStack(stack);
    });
    then(/^the trail has IsMultiRegionTrail (.+)$/, (value: string) => {
      template.hasResourceProperties('AWS::CloudTrail::Trail', {
        IsMultiRegionTrail: value === 'true',
      });
    });
  });

  test('Log file validation enabled by default', ({ given, when, then }: any) => {
    given('a default context', () => {
      context = makeContext({ namespace: '7p', stage: 'prod', name: 'audit' });
      extraProps = {};
    });
    when(/^a CloudTrail construct is created with s3BucketName "(.+)"$/, (bucket: string) => {
      stack = makeStack();
      new CloudTrail(stack, 'SUT', { context, s3BucketName: bucket, ...extraProps } as CloudtrailProps);
      template = Template.fromStack(stack);
    });
    then(/^the trail has EnableLogFileValidation (.+)$/, (value: string) => {
      template.hasResourceProperties('AWS::CloudTrail::Trail', {
        EnableLogFileValidation: value === 'true',
      });
    });
  });

  test('Global service events included by default', ({ given, when, then }: any) => {
    given('a default context', () => {
      context = makeContext({ namespace: '7p', stage: 'prod', name: 'audit' });
      extraProps = {};
    });
    when(/^a CloudTrail construct is created with s3BucketName "(.+)"$/, (bucket: string) => {
      stack = makeStack();
      new CloudTrail(stack, 'SUT', { context, s3BucketName: bucket, ...extraProps } as CloudtrailProps);
      template = Template.fromStack(stack);
    });
    then(/^the trail has IncludeGlobalServiceEvents (.+)$/, (value: string) => {
      template.hasResourceProperties('AWS::CloudTrail::Trail', {
        IncludeGlobalServiceEvents: value === 'true',
      });
    });
  });

  test('CloudWatch log group created when cloudWatchLogsEnabled is true', ({ given, when, then, and }: any) => {
    given(/^a default context with cloudWatchLogsEnabled (.+)$/, (value: string) => {
      context = makeContext({ namespace: '7p', stage: 'prod', name: 'audit' });
      extraProps = { cloudWatchLogsEnabled: value === 'true' };
    });
    when(/^a CloudTrail construct is created with s3BucketName "(.+)"$/, (bucket: string) => {
      stack = makeStack();
      new CloudTrail(stack, 'SUT', { context, s3BucketName: bucket, ...extraProps } as CloudtrailProps);
      template = Template.fromStack(stack);
    });
    then('an AWS::Logs::LogGroup resource exists', () => {
      template.resourceCountIs('AWS::Logs::LogGroup', 1);
    });
    and('the trail has a CloudWatchLogsLogGroupArn', () => {
      template.hasResourceProperties('AWS::CloudTrail::Trail', {
        CloudWatchLogsLogGroupArn: Match.anyValue(),
      });
    });
  });

  test('No CloudWatch log group when cloudWatchLogsEnabled is false', ({ given, when, then }: any) => {
    given('a default context', () => {
      context = makeContext({ namespace: '7p', stage: 'prod', name: 'audit' });
      extraProps = {};
    });
    when(/^a CloudTrail construct is created with s3BucketName "(.+)"$/, (bucket: string) => {
      stack = makeStack();
      new CloudTrail(stack, 'SUT', { context, s3BucketName: bucket, ...extraProps } as CloudtrailProps);
      template = Template.fromStack(stack);
    });
    then('no AWS::Logs::LogGroup resources exist in the stack', () => {
      template.resourceCountIs('AWS::Logs::LogGroup', 0);
    });
  });

  test('Data event selector added when dataEvents provided', ({ given, when, then }: any) => {
    given('a default context with S3 data events', () => {
      context = makeContext({ namespace: '7p', stage: 'prod', name: 'audit' });
      extraProps = {
        dataEvents: [{ resourceType: 'AWS::S3::Object', resourceArns: ['arn:aws:s3:::'] }],
      };
    });
    when(/^a CloudTrail construct is created with s3BucketName "(.+)"$/, (bucket: string) => {
      stack = makeStack();
      new CloudTrail(stack, 'SUT', { context, s3BucketName: bucket, ...extraProps } as CloudtrailProps);
      template = Template.fromStack(stack);
    });
    then('the trail has an EventSelector for S3 objects', () => {
      template.hasResourceProperties('AWS::CloudTrail::Trail', {
        EventSelectors: Match.arrayWith([
          Match.objectLike({
            DataResources: Match.arrayWith([
              Match.objectLike({
                Type: 'AWS::S3::Object',
              }),
            ]),
          }),
        ]),
      });
    });
  });

  test('No resources created when context is disabled', ({ given, when, then, and }: any) => {
    given('a context with enabled false', () => {
      context = makeContext({ namespace: '7p', stage: 'test', name: 'test', enabled: false });
      extraProps = {};
    });
    when(/^a CloudTrail construct is created with s3BucketName "(.+)"$/, (bucket: string) => {
      stack = makeStack();
      new CloudTrail(stack, 'SUT', { context, s3BucketName: bucket, ...extraProps } as CloudtrailProps);
      template = Template.fromStack(stack);
    });
    then('no AWS::CloudTrail::Trail resources exist in the stack', () => {
      template.resourceCountIs('AWS::CloudTrail::Trail', 0);
    });
    and('no AWS::Logs::LogGroup resources exist in the stack', () => {
      template.resourceCountIs('AWS::Logs::LogGroup', 0);
    });
  });
});
