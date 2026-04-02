import {
  aws_cloudtrail as cloudtrail,
  aws_s3 as s3,
  aws_logs as logs,
  aws_sns as sns,
  aws_kms as kms,
  RemovalPolicy,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Context, contextId } from '@sevenpico/cdk-context';
import { CloudtrailProps } from './cloudtrail-types';

export const trailName = (ctx: Context): string => contextId(ctx);

export const logGroupName = (ctx: Context): string =>
  `/aws/cloudtrail/${contextId(ctx)}`;

export const mapReadWriteType = (
  mode?: string,
): cloudtrail.ReadWriteType => {
  const map: Record<string, cloudtrail.ReadWriteType> = {
    ReadWrite: cloudtrail.ReadWriteType.ALL,
    Read: cloudtrail.ReadWriteType.READ_ONLY,
    Write: cloudtrail.ReadWriteType.WRITE_ONLY,
    None: cloudtrail.ReadWriteType.NONE,
  };
  return map[mode ?? 'ReadWrite'] ?? cloudtrail.ReadWriteType.ALL;
};

export const logGroupProps = (
  ctx: Context,
  props: CloudtrailProps,
): logs.LogGroupProps => ({
  logGroupName: logGroupName(ctx),
  retention: (props.cloudWatchLogsRetentionDays ?? 90) as logs.RetentionDays,
  removalPolicy: RemovalPolicy.DESTROY,
});

export const cloudTrailProps = (
  scope: Construct,
  ctx: Context,
  props: CloudtrailProps,
  logGroup?: logs.LogGroup,
): cloudtrail.TrailProps => ({
  trailName: trailName(ctx),
  bucket: s3.Bucket.fromBucketName(scope, 'LogBucket', props.s3BucketName),
  s3KeyPrefix: props.s3KeyPrefix ?? '',
  includeGlobalServiceEvents: props.includeGlobalServiceEvents ?? true,
  isMultiRegionTrail: props.isMultiRegionTrail ?? true,
  enableFileValidation: props.enableLogFileValidation ?? true,
  cloudWatchLogGroup: logGroup,
  sendToCloudWatchLogs: logGroup !== undefined,
  snsTopic: props.snsTopicArn
    ? sns.Topic.fromTopicArn(scope, 'SnsTopic', props.snsTopicArn)
    : undefined,
  encryptionKey: props.kmsKeyArn
    ? kms.Key.fromKeyArn(scope, 'KmsKey', props.kmsKeyArn)
    : undefined,
  insightTypes: props.enableInsights
    ? [cloudtrail.InsightType.API_CALL_RATE, cloudtrail.InsightType.API_ERROR_RATE]
    : undefined,
  managementEvents: mapReadWriteType(props.managementEvents),
});
