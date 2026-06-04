import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { S3LogStorage } from '@sevenpico/cdk-construct-s3-log-storage';

const app = new App();
const stack = new Stack(app, 'S3LogStorageMinimalStack');

const context = CdkBridge.context(stack);

new S3LogStorage(stack, 'LogStorage', {
  context,
});

app.synth();
