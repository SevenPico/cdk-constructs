import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { CloudTrail } from '@sevenpico/cdk-construct-cloudtrail';

const app = new App();
const stack = new Stack(app, 'CloudtrailDisabledStack');

const context = CdkBridge.context(stack);

new CloudTrail(stack, 'Trail', {
  context,
  s3BucketName: 'my-cloudtrail-logs-bucket',
});

app.synth();
