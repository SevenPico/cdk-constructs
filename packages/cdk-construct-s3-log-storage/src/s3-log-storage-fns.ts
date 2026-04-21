import { S3BucketProps } from '@sevenpico/cdk-construct-s3-bucket';
import { Context, contextId } from '@sevenpico/cdk-context';
import { RemovalPolicy, aws_sqs as sqs } from 'aws-cdk-lib';
import { S3LogStorageProps } from './s3-log-storage-types';

export const toS3BucketProps = (ctx: Context, props: S3LogStorageProps): S3BucketProps => ({
  context: ctx,
  bucketName: props.bucketName,
  versioningEnabled: props.versioningEnabled ?? true,
  sseAlgorithm: props.sseAlgorithm ?? 'AES256',
  kmsKeyArn: props.kmsKeyArn,
  bucketKeyEnabled: props.bucketKeyEnabled ?? false,
  blockPublicAcls: props.blockPublicAcls ?? true,
  blockPublicPolicy: props.blockPublicPolicy ?? true,
  ignorePublicAcls: props.ignorePublicAcls ?? true,
  restrictPublicBuckets: props.restrictPublicBuckets ?? true,
  forceDestroy: props.forceDestroy ?? false,
  allowSslRequestsOnly: props.allowSslRequestsOnly ?? true,
  sourcePolicyDocuments: props.sourcePolicyDocuments,
  objectOwnership: props.objectOwnership ?? 'ObjectWriter',
  lifecycleRules: props.lifecycleRules,
  loggingBucketName: props.accessLogBucketName,
  loggingPrefix: props.accessLogPrefix,
  mfaDeleteEnabled: props.mfaDeleteEnabled ?? false,
});

export const notificationQueueProps = (ctx: Context): sqs.QueueProps => ({
  queueName: `${contextId(ctx)}-notifications`,
  removalPolicy: RemovalPolicy.DESTROY,
});
