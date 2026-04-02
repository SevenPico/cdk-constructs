import { Construct } from 'constructs';
import { Tags } from 'aws-cdk-lib';
import { aws_redshift as redshift } from 'aws-cdk-lib';
import { contextTags, isEnabled } from '@sevenpico/cdk-context';
import { RedshiftClusterProps } from './redshift-cluster-types';
import { cfnClusterProps, subnetGroupName, parameterGroupName } from './redshift-cluster-fns';

export class RedshiftCluster extends Construct {
  public readonly cluster?: redshift.CfnCluster;
  public readonly subnetGroup?: redshift.CfnClusterSubnetGroup;
  public readonly parameterGroup?: redshift.CfnClusterParameterGroup;

  constructor(scope: Construct, id: string, props: RedshiftClusterProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    this.subnetGroup = new redshift.CfnClusterSubnetGroup(this, 'SubnetGroup', {
      description: subnetGroupName(props.context),
      subnetIds: props.subnetIds,
    });

    this.parameterGroup = new redshift.CfnClusterParameterGroup(this, 'ParamGroup', {
      description: parameterGroupName(props.context),
      parameterGroupFamily: `redshift-${props.engineVersion ?? '1.0'}`,
      parameters: (props.clusterParameters ?? []).map(p => ({
        parameterName: p.name,
        parameterValue: p.value,
      })),
    });

    this.cluster = new redshift.CfnCluster(this, 'Cluster',
      cfnClusterProps(
        props.context,
        props,
        this.subnetGroup.ref,
        this.parameterGroup.ref,
      ),
    );

    // skipFinalSnapshot and finalSnapshotIdentifier not in CDK 2.246 CfnClusterProps
    this.cluster.addPropertyOverride('SkipFinalSnapshot', props.skipFinalSnapshot ?? true);
    if (props.finalSnapshotIdentifier) {
      this.cluster.addPropertyOverride('FinalSnapshotIdentifier', props.finalSnapshotIdentifier);
    }

    Object.entries(contextTags(props.context)).forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}
