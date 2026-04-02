import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { S3Bucket } from '@sevenpico/cdk-construct-s3-bucket';

const app = new App();
const stack = new Stack(app, 'S3BucketKmsEncryptedStack');

// Context and kmsKeyArn come from the bridge fixture (cdk.json sevenpico block)
const context = CdkBridge.context(stack);
const kmsKeyArn = CdkBridge.string(stack, 'kmsKeyArn');

// KMS-encrypted bucket — sseAlgorithm 'aws:kms' with a KMS key ARN from the bridge fixture.
// Creates a KMS grant resource in addition to the bucket.
new S3Bucket(stack, 'Bucket', {
  context,
  sseAlgorithm: 'aws:kms',
  kmsKeyArn,
  bucketKeyEnabled: true,
  allowEncryptedUploadsOnly: true,
});

app.synth();
