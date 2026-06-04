import { S3Bucket } from '@sevenpico/cdk-construct-s3-bucket';
import { contextTags, isEnabled } from '@sevenpico/cdk-context';
import {
  Tags,
  aws_s3 as s3,
  aws_sqs as sqs,
  aws_s3_notifications as s3n,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { toS3BucketProps, notificationQueueProps } from './s3-log-storage-fns';
import { S3LogStorageProps } from './s3-log-storage-types';

export class S3LogStorage extends Construct {
  public readonly bucket?: s3.Bucket;
  public readonly notificationQueue?: sqs.Queue;

  constructor(scope: Construct, id: string, props: S3LogStorageProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    const s3Construct = new S3Bucket(this, 'Bucket', toS3BucketProps(props.context, props));
    this.bucket = s3Construct.bucket;

    if (props.notificationsEnabled && (props.notificationsType ?? 'SQS') === 'SQS') {
      this.notificationQueue = new sqs.Queue(
        this, 'NotificationQueue', notificationQueueProps(props.context),
      );
      if (this.bucket) {
        const args: [s3.EventType, s3.IBucketNotificationDestination, ...s3.NotificationKeyFilter[]] = [
          s3.EventType.OBJECT_CREATED,
          new s3n.SqsDestination(this.notificationQueue),
        ];
        if (props.notificationsPrefix) {
          args.push({ prefix: props.notificationsPrefix });
        }
        this.bucket.addEventNotification(...args);
      }
    }

    Object.entries(contextTags(props.context)).forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}
