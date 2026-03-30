import { Construct } from 'constructs';
import { Tags } from 'aws-cdk-lib';
import { Context, contextTags, isEnabled } from '@sevenpico/cdk-context';
import { cloudwatchFlowLogsProps, CloudwatchFlowLogsOptions } from './cloudwatch-flow-logs-fns';

export interface CloudwatchFlowLogsProps extends CloudwatchFlowLogsOptions {
  readonly context: Context;
}

export class CloudwatchFlowLogs extends Construct {
  constructor(scope: Construct, id: string, props: CloudwatchFlowLogsProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    // TODO: create AWS resources using cloudwatchFlowLogsProps(props.context, props)
    Object.entries(contextTags(props.context))
      .forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}
