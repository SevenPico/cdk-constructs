import { App, Stack } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { S3Bucket } from '@sevenpico/cdk-construct-s3-bucket';

const app = new App();
const stack = new Stack(app, 'S3BucketMinimalStack');

const context = makeContext({
  namespace: 'acme',
  environment: 'dev',
  stage: 'app',
});

new S3Bucket(stack, 'Bucket', { context });

app.synth();
