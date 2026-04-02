import { Construct } from 'constructs';
import { Tags } from 'aws-cdk-lib';
import {
  aws_cloudtrail as cloudtrail,
  aws_logs as logs,
} from 'aws-cdk-lib';
import { contextTags, isEnabled } from '@sevenpico/cdk-context';
import { CloudtrailProps } from './cloudtrail-types';
import { cloudTrailProps, logGroupProps } from './cloudtrail-fns';

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

    this.trail = new cloudtrail.Trail(
      this,
      'Trail',
      cloudTrailProps(this, props.context, props, this.logGroup),
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
