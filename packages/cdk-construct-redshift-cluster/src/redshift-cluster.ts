import { Construct } from 'constructs';
import { Tags } from 'aws-cdk-lib';
import { Context, contextTags, isEnabled } from '@sevenpico/cdk-context';
import { redshiftClusterProps, RedshiftClusterOptions } from './redshift-cluster-fns';

export interface RedshiftClusterProps extends RedshiftClusterOptions {
  readonly context: Context;
}

export class RedshiftCluster extends Construct {
  constructor(scope: Construct, id: string, props: RedshiftClusterProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    // TODO: create AWS resources using redshiftClusterProps(props.context, props)
    Object.entries(contextTags(props.context))
      .forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}
