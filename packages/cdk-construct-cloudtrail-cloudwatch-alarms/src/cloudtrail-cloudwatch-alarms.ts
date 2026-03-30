import { Construct } from 'constructs';
import { Tags } from 'aws-cdk-lib';
import { Context, contextTags, isEnabled } from '@sevenpico/cdk-context';
import { cloudtrailCloudwatchAlarmsProps, CloudtrailCloudwatchAlarmsOptions } from './cloudtrail-cloudwatch-alarms-fns';

export interface CloudtrailCloudwatchAlarmsProps extends CloudtrailCloudwatchAlarmsOptions {
  readonly context: Context;
}

export class CloudtrailCloudwatchAlarms extends Construct {
  constructor(scope: Construct, id: string, props: CloudtrailCloudwatchAlarmsProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    // TODO: create AWS resources using cloudtrailCloudwatchAlarmsProps(props.context, props)
    Object.entries(contextTags(props.context))
      .forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}
