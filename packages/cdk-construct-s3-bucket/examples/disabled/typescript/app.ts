import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { S3Bucket } from '@sevenpico/cdk-construct-s3-bucket';

const app = new App();
const stack = new Stack(app, 'S3BucketDisabledStack');

// enabled: false — S3Bucket creates no resources.
const context = CdkBridge.context(stack);

new S3Bucket(stack, 'Bucket', { context });

app.synth();
