import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { S3LogStorage } from '@sevenpico/cdk-construct-s3-log-storage';

const app = new App();
const stack = new Stack(app, 'S3LogStorageDisabledStack');

// Load context from CDK Bridge JSON. The cdk.json sets enabled: false,
// so the construct will create no resources.
const context = CdkBridge.context(stack);

const storage = new S3LogStorage(stack, 'LogStorage', {
  context,
});

// bucket and notificationQueue are undefined when disabled.
console.log('bucket:', storage.bucket);         // undefined
console.log('queue:', storage.notificationQueue); // undefined

app.synth();
