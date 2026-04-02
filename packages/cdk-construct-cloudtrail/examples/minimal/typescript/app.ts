import { App, Stack } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { CloudTrail } from '@sevenpico/cdk-construct-cloudtrail';

const app = new App();
const stack = new Stack(app, 'CloudtrailMinimalStack');

const context = makeContext({
  namespace: 'acme',
  environment: 'dev',
  stage: 'app',
});

new CloudTrail(stack, 'Trail', {
  context,
  s3BucketName: 'my-cloudtrail-logs-bucket',
});

app.synth();
