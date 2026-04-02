import { Context } from '@sevenpico/cdk-context';

export interface RedshiftClusterParameter {
  readonly name: string;
  readonly value: string;
}

export interface RedshiftClusterProps {
  readonly context: Context;
  readonly subnetIds: string[];
  readonly adminPassword: string;
  readonly clusterIdentifier?: string;
  readonly databaseName?: string;
  readonly adminUser?: string;
  readonly nodeType?: string;
  readonly clusterType?: string;
  readonly numberOfNodes?: number;
  readonly vpcSecurityGroupIds?: string[];
  readonly availabilityZone?: string;
  readonly preferredMaintenanceWindow?: string;
  readonly automatedSnapshotRetentionPeriod?: number;
  readonly port?: number;
  readonly engineVersion?: string;
  readonly publiclyAccessible?: boolean;
  readonly encrypted?: boolean;
  readonly kmsKeyArn?: string;
  readonly enhancedVpcRouting?: boolean;
  readonly elasticIp?: string;
  readonly skipFinalSnapshot?: boolean;
  readonly finalSnapshotIdentifier?: string;
  readonly snapshotIdentifier?: string;
  readonly iamRoles?: string[];
  readonly loggingEnabled?: boolean;
  readonly loggingBucketName?: string;
  readonly loggingS3KeyPrefix?: string;
  readonly allowVersionUpgrade?: boolean;
  readonly availabilityZoneRelocationEnabled?: boolean;
  readonly clusterParameters?: RedshiftClusterParameter[];
}
