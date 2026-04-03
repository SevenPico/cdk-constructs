import { App, Stack } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { CloudTrail } from '@sevenpico/cdk-construct-cloudtrail';

const app = new App();
const stack = new Stack(app, 'CloudtrailComprehensiveStack');

const context = makeContext({
  namespace: 'acme',
  environment: 'dev',
  stage: 'app',
});

new CloudTrail(stack, 'Trail', {
  context,
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

app.synth();
