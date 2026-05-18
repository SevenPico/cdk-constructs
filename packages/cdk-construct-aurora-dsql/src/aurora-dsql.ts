import { contextTags, isEnabled } from '@sevenpico/cdk-context';
import {
  Tags,
  aws_dsql as dsql,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AuroraDsqlProps } from './aurora-dsql-types';

export class AuroraDsql extends Construct {
  public readonly cluster?: dsql.CfnCluster;
  public readonly clusterArn?: string;
  public readonly clusterEndpoint?: string;

  constructor(scope: Construct, id: string, props: AuroraDsqlProps) {
    super(scope, id);

    if (!isEnabled(props.context)) return;

    this.cluster = new dsql.CfnCluster(this, 'Cluster', {
      deletionProtectionEnabled: props.deleteProtection ?? true,
    });

    this.clusterArn = this.cluster.attrResourceArn;
    this.clusterEndpoint = this.cluster.attrEndpoint;

    Object.entries(contextTags(props.context)).forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}
