import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { makeContext } from '@sevenpico/cdk-context';
import { CloudTrail } from '../src/cloudtrail';

function makeStack(): Stack {
  const app = new App();
  return new Stack(app, 'TestStack');
}

const CONTEXT = makeContext({ namespace: 'acme', environment: 'dev', stage: 'app' });

describe('Example: minimal', () => {
  let template: Template;
  beforeAll(() => {
    const stack = makeStack();
    new CloudTrail(stack, 'Trail', {
      context: CONTEXT,
      s3BucketName: 'my-cloudtrail-logs-bucket',
    });
    template = Template.fromStack(stack);
  });
  test('creates exactly 1 CloudTrail trail', () => {
    template.resourceCountIs('AWS::CloudTrail::Trail', 1);
  });
});

describe('Example: comprehensive', () => {
  let template: Template;
  beforeAll(() => {
    const stack = makeStack();
    new CloudTrail(stack, 'Trail', {
      context: CONTEXT,
      s3BucketName: 'my-cloudtrail-logs-bucket',
      s3KeyPrefix: 'cloudtrail/',
      includeGlobalServiceEvents: true,
      isMultiRegionTrail: true,
      enableLogFileValidation: true,
      cloudWatchLogsEnabled: true,
      cloudWatchLogsRetentionDays: 90,
      enableInsights: true,
      managementEvents: 'ReadWrite',
      dataEvents: [
        {
          resourceType: 'AWS::S3::Object',
          resourceArns: ['arn:aws:s3:::'],
        },
      ],
    });
    template = Template.fromStack(stack);
  });
  test('creates exactly 1 CloudTrail trail', () => {
    template.resourceCountIs('AWS::CloudTrail::Trail', 1);
  });
  test('creates a CloudWatch Logs log group when cloudWatchLogsEnabled', () => {
    template.resourceCountIs('AWS::Logs::LogGroup', 1);
  });
});

describe('Example: disabled', () => {
  let template: Template;
  beforeAll(() => {
    const stack = makeStack();
    new CloudTrail(stack, 'Trail', {
      context: makeContext({ namespace: 'acme', environment: 'dev', stage: 'app', enabled: false }),
      s3BucketName: 'my-cloudtrail-logs-bucket',
    });
    template = Template.fromStack(stack);
  });
  test('creates zero CloudTrail trails when disabled', () => {
    template.resourceCountIs('AWS::CloudTrail::Trail', 0);
  });
});
