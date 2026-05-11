import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { S3Bucket } from '@sevenpico/cdk-construct-s3-bucket';

const app = new App();
const stack = new Stack(app, 'S3BucketComprehensiveStack');

const context = CdkBridge.context(stack);

new S3Bucket(stack, 'Bucket', {
  context,
  versioningEnabled: true,
  transferAccelerationEnabled: true,
  objectOwnership: 'BucketOwnerEnforced',
  allowSslRequestsOnly: true,
  lifecycleRules: [
    {
      id: 'expire-old-versions',
      enabled: true,
      noncurrentVersionExpirationDays: 30,
      transitions: [
        { storageClass: 'STANDARD_IA', transitionAfterDays: 90 },
        { storageClass: 'GLACIER', transitionAfterDays: 365 },
      ],
      abortIncompleteMultipartUploadAfterDays: 7,
    },
  ],
  corsRules: [
    {
      allowedMethods: ['GET', 'PUT'],
      allowedOrigins: ['https://acme.example.com'],
      allowedHeaders: ['*'],
      maxAge: 3600,
    },
  ],
});

app.synth();
