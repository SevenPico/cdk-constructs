import { App, Stack } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { S3Bucket } from '@sevenpico/cdk-construct-s3-bucket';

const app = new App();
const stack = new Stack(app, 'S3BucketKmsEncryptedStack');

const context = makeContext({
  namespace: 'acme',
  environment: 'dev',
  stage: 'app',
  tags: { Owner: 'platform-team', CostCenter: 'engineering' },
});

// KMS-encrypted bucket — sseAlgorithm 'aws:kms' with a KMS key ARN.
// Creates a KMS grant resource in addition to the bucket.
new S3Bucket(stack, 'Bucket', {
  context,
  sseAlgorithm: 'aws:kms',
  kmsKeyArn: 'arn:aws:kms:us-east-1:123456789012:key/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  bucketKeyEnabled: true,
  allowEncryptedUploadsOnly: true,
});

app.synth();
