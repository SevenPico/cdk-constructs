import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { S3Bucket } from '@sevenpico/cdk-construct-s3-bucket';

const app = new App();
const stack = new Stack(app, 'S3BucketS3ManagedEncryptedStack');

const context = CdkBridge.context(stack);

// S3-managed encryption — AES256 (default). No KMS key needed.
// This is the same as the minimal scenario but makes the encryption explicit.
new S3Bucket(stack, 'Bucket', {
  context,
  sseAlgorithm: 'AES256',
});

app.synth();
