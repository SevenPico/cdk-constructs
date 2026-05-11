import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { S3LogStorage } from '@sevenpico/cdk-construct-s3-log-storage';

const app = new App();
const stack = new Stack(app, 'S3LogStorageComprehensiveStack');

const context = CdkBridge.context(stack);
const logKmsKeyArn = 'arn:aws:kms:us-east-1:123456789012:key/bbbbbbbb-cccc-dddd-eeee-ffffffffffff';
const logsBucketName = 'acme-dev-app-logs-123456789012';

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
