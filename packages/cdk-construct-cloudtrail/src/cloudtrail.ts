import { contextTags, isEnabled } from '@sevenpico/cdk-context';
import {
  Tags,
  aws_cloudtrail as cloudtrail,
  aws_logs as logs,
  aws_s3 as s3,
  aws_sns as sns,
  aws_kms as kms,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { cloudTrailProps, logGroupProps } from './cloudtrail-fns';
import { CloudtrailProps } from './cloudtrail-types';

export class CloudTrail extends Construct {
  public readonly trail?: cloudtrail.Trail;
  public readonly logGroup?: logs.LogGroup;

  constructor(scope: Construct, id: string, props: CloudtrailProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    if (props.cloudWatchLogsEnabled) {
      this.logGroup = new logs.LogGroup(
        this,
        'LogGroup',
        logGroupProps(props.context, props),
      );
    }

    const bucket = s3.Bucket.fromBucketName(this, 'LogBucket', props.s3BucketName);
    const snsTopic = props.snsTopicArn
      ? sns.Topic.fromTopicArn(this, 'SnsTopic', props.snsTopicArn)
      : undefined;
    const encryptionKey = props.kmsKeyArn
      ? kms.Key.fromKeyArn(this, 'KmsKey', props.kmsKeyArn)
      : undefined;

    this.trail = new cloudtrail.Trail(
      this,
      'Trail',
      cloudTrailProps(props.context, props, this.logGroup, bucket, snsTopic, encryptionKey),
    );

    (props.dataEvents ?? []).forEach((sel) => {
      this.trail!.addEventSelector(sel.resourceType as cloudtrail.DataResourceType, sel.resourceArns, {
        readWriteType: cloudtrail.ReadWriteType.ALL,
      });
    });

    Object.entries(contextTags(props.context)).forEach(([k, v]) =>
      Tags.of(this).add(k, v),
    );
  }
}
