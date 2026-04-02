import { makeContext } from '@sevenpico/cdk-context';
import {
  clusterIdentifier, subnetGroupName, parameterGroupName, cfnClusterProps,
} from '../src/redshift-cluster-fns';
import { RedshiftClusterProps } from '../src/redshift-cluster-types';

const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'analytics' });

const baseProps: RedshiftClusterProps = {
  context: ctx,
  subnetIds: ['subnet-aaa', 'subnet-bbb'],
  adminPassword: 'SuperSecret1!',
};

describe('clusterIdentifier', () => {
  test('returns context ID by default', () => {
    expect(clusterIdentifier(ctx, baseProps)).toBe('7p-prod-analytics');
  });

  test('returns custom identifier when provided', () => {
    expect(clusterIdentifier(ctx, { ...baseProps, clusterIdentifier: 'my-cluster' })).toBe('my-cluster');
  });
});

describe('subnetGroupName', () => {
  test('returns context ID with suffix', () => {
    expect(subnetGroupName(ctx)).toBe('7p-prod-analytics-subnet-group');
  });
});

describe('parameterGroupName', () => {
  test('returns context ID with suffix', () => {
    expect(parameterGroupName(ctx)).toBe('7p-prod-analytics-param-group');
  });
});

describe('cfnClusterProps', () => {
  const result = cfnClusterProps(ctx, baseProps, 'sg-ref', 'pg-ref');

  test('uses context ID as cluster identifier', () => {
    expect(result.clusterIdentifier).toBe('7p-prod-analytics');
  });

  test('defaults database name to dev', () => {
    expect(result.dbName).toBe('dev');
  });

  test('defaults admin user to admin', () => {
    expect(result.masterUsername).toBe('admin');
  });

  test('passes admin password through', () => {
    expect(result.masterUserPassword).toBe('SuperSecret1!');
  });

  test('defaults node type to dc2.large', () => {
    expect(result.nodeType).toBe('dc2.large');
  });

  test('defaults cluster type to single-node', () => {
    expect(result.clusterType).toBe('single-node');
  });

  test('numberOfNodes is undefined for single-node', () => {
    expect(result.numberOfNodes).toBeUndefined();
  });

  test('numberOfNodes defaults to 2 for multi-node', () => {
    const multiResult = cfnClusterProps(ctx, { ...baseProps, clusterType: 'multi-node' }, 'sg', 'pg');
    expect(multiResult.numberOfNodes).toBe(2);
  });

  test('defaults port to 5439', () => {
    expect(result.port).toBe(5439);
  });

  test('defaults publiclyAccessible to false', () => {
    expect(result.publiclyAccessible).toBe(false);
  });

  test('defaults encrypted to false', () => {
    expect(result.encrypted).toBe(false);
  });

  test('defaults enhancedVpcRouting to false', () => {
    expect(result.enhancedVpcRouting).toBe(false);
  });

  test('defaults automatedSnapshotRetentionPeriod to 1', () => {
    expect(result.automatedSnapshotRetentionPeriod).toBe(1);
  });

  test('defaults allowVersionUpgrade to false', () => {
    expect(result.allowVersionUpgrade).toBe(false);
  });

  test('defaults availabilityZoneRelocation to false', () => {
    expect(result.availabilityZoneRelocation).toBe(false);
  });

  test('loggingProperties undefined when not enabled', () => {
    expect(result.loggingProperties).toBeUndefined();
  });

  test('loggingProperties set when enabled with bucket', () => {
    const logResult = cfnClusterProps(ctx, {
      ...baseProps,
      loggingEnabled: true,
      loggingBucketName: 'my-log-bucket',
      loggingS3KeyPrefix: 'redshift/',
    }, 'sg', 'pg');
    expect(logResult.loggingProperties).toEqual({
      bucketName: 'my-log-bucket',
      s3KeyPrefix: 'redshift/',
    });
  });

  test('passes subnet group and param group refs', () => {
    expect(result.clusterSubnetGroupName).toBe('sg-ref');
    expect(result.clusterParameterGroupName).toBe('pg-ref');
  });

  test('includes context tags', () => {
    expect(result.tags).toBeDefined();
    expect(result.tags!.length).toBeGreaterThan(0);
  });

  test('passes kmsKeyId when kmsKeyArn provided', () => {
    const encResult = cfnClusterProps(ctx, {
      ...baseProps,
      encrypted: true,
      kmsKeyArn: 'arn:aws:kms:us-east-1:123:key/abc',
    }, 'sg', 'pg');
    expect(encResult.kmsKeyId).toBe('arn:aws:kms:us-east-1:123:key/abc');
  });

  test('passes IAM roles when provided', () => {
    const iamResult = cfnClusterProps(ctx, {
      ...baseProps,
      iamRoles: ['arn:aws:iam::123:role/role1'],
    }, 'sg', 'pg');
    expect(iamResult.iamRoles).toEqual(['arn:aws:iam::123:role/role1']);
  });
});
