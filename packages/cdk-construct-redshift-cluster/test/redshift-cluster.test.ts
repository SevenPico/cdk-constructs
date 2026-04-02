import { App, Stack } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { makeContext } from '@sevenpico/cdk-context';
import { RedshiftCluster } from '../src/redshift-cluster';
import { RedshiftClusterProps } from '../src/redshift-cluster-types';

const context = makeContext({ namespace: '7p', stage: 'prod', name: 'analytics' });

const baseProps: RedshiftClusterProps = {
  context,
  subnetIds: ['subnet-aaa', 'subnet-bbb'],
  adminPassword: 'SuperSecret1!',
};

const synthTemplate = (props: RedshiftClusterProps): Template => {
  const app = new App();
  const stack = new Stack(app, 'TestStack');
  new RedshiftCluster(stack, 'SUT', props);
  return Template.fromStack(stack);
};

describe('RedshiftCluster construct', () => {
  describe('Cluster Naming', () => {
    test('cluster identifier uses context ID', () => {
      const template = synthTemplate(baseProps);
      template.hasResourceProperties('AWS::Redshift::Cluster', {
        ClusterIdentifier: '7p-prod-analytics',
      });
    });
  });

  describe('Defaults', () => {
    test('single-node cluster with dc2.large by default', () => {
      const template = synthTemplate(baseProps);
      template.hasResourceProperties('AWS::Redshift::Cluster', {
        ClusterType: 'single-node',
        NodeType: 'dc2.large',
      });
    });

    test('cluster is not publicly accessible by default', () => {
      const template = synthTemplate(baseProps);
      template.hasResourceProperties('AWS::Redshift::Cluster', {
        PubliclyAccessible: false,
      });
    });

    test('encryption disabled by default', () => {
      const template = synthTemplate(baseProps);
      template.hasResourceProperties('AWS::Redshift::Cluster', {
        Encrypted: false,
      });
    });

    test('database name defaults to dev', () => {
      const template = synthTemplate(baseProps);
      template.hasResourceProperties('AWS::Redshift::Cluster', {
        DBName: 'dev',
      });
    });

    test('admin user defaults to admin', () => {
      const template = synthTemplate(baseProps);
      template.hasResourceProperties('AWS::Redshift::Cluster', {
        MasterUsername: 'admin',
      });
    });

    test('port defaults to 5439', () => {
      const template = synthTemplate(baseProps);
      template.hasResourceProperties('AWS::Redshift::Cluster', {
        Port: 5439,
      });
    });

    test('skip final snapshot defaults to true', () => {
      const template = synthTemplate(baseProps);
      template.hasResourceProperties('AWS::Redshift::Cluster', {
        SkipFinalSnapshot: true,
      });
    });

    test('final snapshot identifier set when provided', () => {
      const template = synthTemplate({
        ...baseProps,
        skipFinalSnapshot: false,
        finalSnapshotIdentifier: 'my-final-snap',
      });
      template.hasResourceProperties('AWS::Redshift::Cluster', {
        SkipFinalSnapshot: false,
        FinalSnapshotIdentifier: 'my-final-snap',
      });
    });
  });

  describe('Multi-node', () => {
    test('multi-node cluster sets numberOfNodes', () => {
      const template = synthTemplate({
        ...baseProps,
        clusterType: 'multi-node',
        numberOfNodes: 4,
      });
      template.hasResourceProperties('AWS::Redshift::Cluster', {
        ClusterType: 'multi-node',
        NumberOfNodes: 4,
      });
    });
  });

  describe('Encryption', () => {
    test('encryption with KMS key', () => {
      const template = synthTemplate({
        ...baseProps,
        encrypted: true,
        kmsKeyArn: 'arn:aws:kms:us-east-1:123456789012:key/abc-123',
      });
      template.hasResourceProperties('AWS::Redshift::Cluster', {
        Encrypted: true,
        KmsKeyId: 'arn:aws:kms:us-east-1:123456789012:key/abc-123',
      });
    });
  });

  describe('Logging', () => {
    test('logging properties set when enabled', () => {
      const template = synthTemplate({
        ...baseProps,
        loggingEnabled: true,
        loggingBucketName: 'my-log-bucket',
        loggingS3KeyPrefix: 'redshift/',
      });
      template.hasResourceProperties('AWS::Redshift::Cluster', {
        LoggingProperties: {
          BucketName: 'my-log-bucket',
          S3KeyPrefix: 'redshift/',
        },
      });
    });
  });

  describe('Associated Resources', () => {
    test('subnet group is created', () => {
      const template = synthTemplate(baseProps);
      template.hasResourceProperties('AWS::Redshift::ClusterSubnetGroup', {
        SubnetIds: ['subnet-aaa', 'subnet-bbb'],
      });
    });

    test('parameter group is created', () => {
      const template = synthTemplate(baseProps);
      template.hasResourceProperties('AWS::Redshift::ClusterParameterGroup', {
        ParameterGroupFamily: 'redshift-1.0',
      });
    });

    test('parameter group with custom parameters', () => {
      const template = synthTemplate({
        ...baseProps,
        clusterParameters: [
          { name: 'enable_user_activity_logging', value: 'true' },
        ],
      });
      template.hasResourceProperties('AWS::Redshift::ClusterParameterGroup', {
        Parameters: Match.arrayWith([
          { ParameterName: 'enable_user_activity_logging', ParameterValue: 'true' },
        ]),
      });
    });
  });

  describe('IAM Roles', () => {
    test('IAM roles passed to cluster', () => {
      const template = synthTemplate({
        ...baseProps,
        iamRoles: ['arn:aws:iam::123456789012:role/RedshiftRole'],
      });
      template.hasResourceProperties('AWS::Redshift::Cluster', {
        IamRoles: ['arn:aws:iam::123456789012:role/RedshiftRole'],
      });
    });
  });

  describe('Disabled Construct', () => {
    test('no resources created when context is disabled', () => {
      const disabledCtx = makeContext({
        namespace: '7p', stage: 'prod', name: 'analytics', enabled: false,
      });
      const template = synthTemplate({ ...baseProps, context: disabledCtx });
      expect(Object.keys(template.toJSON().Resources ?? {})).toHaveLength(0);
    });
  });
});
