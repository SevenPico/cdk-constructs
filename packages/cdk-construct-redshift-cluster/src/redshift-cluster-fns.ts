import { aws_redshift as redshift } from 'aws-cdk-lib';
import { Context, contextId, contextTags } from '@sevenpico/cdk-context';
import { RedshiftClusterProps } from './redshift-cluster-types';

export const clusterIdentifier = (ctx: Context, props: RedshiftClusterProps): string =>
  props.clusterIdentifier ?? contextId(ctx);

export const subnetGroupName = (ctx: Context): string => `${contextId(ctx)}-subnet-group`;

export const parameterGroupName = (ctx: Context): string => `${contextId(ctx)}-param-group`;

export const cfnClusterProps = (
  ctx: Context,
  props: RedshiftClusterProps,
  subnetGroupId: string,
  paramGroupName: string,
): redshift.CfnClusterProps => ({
  clusterIdentifier: clusterIdentifier(ctx, props),
  dbName: props.databaseName ?? 'dev',
  masterUsername: props.adminUser ?? 'admin',
  masterUserPassword: props.adminPassword,
  nodeType: props.nodeType ?? 'dc2.large',
  clusterType: props.clusterType ?? 'single-node',
  numberOfNodes: (props.clusterType === 'multi-node')
    ? (props.numberOfNodes ?? 2)
    : undefined,
  clusterSubnetGroupName: subnetGroupId,
  clusterParameterGroupName: paramGroupName,
  vpcSecurityGroupIds: props.vpcSecurityGroupIds,
  availabilityZone: props.availabilityZone,
  preferredMaintenanceWindow: props.preferredMaintenanceWindow,
  automatedSnapshotRetentionPeriod: props.automatedSnapshotRetentionPeriod ?? 1,
  port: props.port ?? 5439,
  allowVersionUpgrade: props.allowVersionUpgrade ?? false,
  publiclyAccessible: props.publiclyAccessible ?? false,
  encrypted: props.encrypted ?? false,
  kmsKeyId: props.kmsKeyArn,
  enhancedVpcRouting: props.enhancedVpcRouting ?? false,
  elasticIp: props.elasticIp,
  snapshotIdentifier: props.snapshotIdentifier,
  iamRoles: props.iamRoles,
  availabilityZoneRelocation: props.availabilityZoneRelocationEnabled ?? false,
  loggingProperties: (props.loggingEnabled && props.loggingBucketName)
    ? { bucketName: props.loggingBucketName, s3KeyPrefix: props.loggingS3KeyPrefix }
    : undefined,
  tags: Object.entries(contextTags(ctx)).map(([key, value]) => ({ key, value })),
});
