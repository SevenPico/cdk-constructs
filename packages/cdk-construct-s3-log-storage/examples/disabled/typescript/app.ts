import { App, Stack } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { S3LogStorage } from '@sevenpico/cdk-construct-s3-log-storage';

const app = new App();
const stack = new Stack(app, 'S3LogStorageDisabledStack');

// enabled: false — the construct will create no resources.
const context = makeContext({
  namespace: 'acme',
  environment: 'dev',
  stage: 'app',
  enabled: false,
});

const storage = new S3LogStorage(stack, 'LogStorage', {
  context,
});

// bucket and notificationQueue are undefined when disabled.
console.log('bucket:', storage.bucket);         // undefined
console.log('queue:', storage.notificationQueue); // undefined

app.synth();
