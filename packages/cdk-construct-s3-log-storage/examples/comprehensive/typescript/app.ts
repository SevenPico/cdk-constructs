import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { S3LogStorage } from '@sevenpico/cdk-construct-s3-log-storage';

const app = new App();
const stack = new Stack(app, 'S3LogStorageComprehensiveStack');

// Load context and platform references from CDK Bridge JSON.
const context = CdkBridge.context(stack);
const logKmsKeyArn = CdkBridge.string(stack, 'logKmsKeyArn');
const logsBucketName = CdkBridge.string(stack, 'logsBucketName');

new S3LogStorage(stack, 'LogStorage', {
  context,

  // KMS encryption for stored objects
  sseAlgorithm: 'aws:kms',
  kmsKeyArn: logKmsKeyArn,
  bucketKeyEnabled: true,

  // Access logs for this bucket go into the central logs bucket
  accessLogBucketName: logsBucketName,
  accessLogPrefix: 'acme-dev-app-logs/',

  // SQS notifications for new objects under raw/
  notificationsEnabled: true,
  notificationsType: 'SQS',
  notificationsPrefix: 'raw/',

  // Lifecycle: transition to Glacier after 90 days, expire after 365
  lifecycleRules: [
    {
      id: 'expire-old-logs',
      enabled: true,
      expirationDays: 365,
      noncurrentVersionExpirationDays: 30,
      transitions: [
        {
          storageClass: 'GLACIER',
          transitionAfterDays: 90,
        },
      ],
      abortIncompleteMultipartUploadAfterDays: 7,
    },
  ],

  // Public access blocks (all defaults, shown explicitly)
  blockPublicAcls: true,
  blockPublicPolicy: true,
  ignorePublicAcls: true,
  restrictPublicBuckets: true,

  // SSL-only policy and versioning
  allowSslRequestsOnly: true,
  versioningEnabled: true,
  objectOwnership: 'ObjectWriter',
});

app.synth();
