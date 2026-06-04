import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { RedshiftCluster } from '@sevenpico/cdk-construct-redshift-cluster';

const app = new App();
const stack = new Stack(app, 'RedshiftClusterEncryptedStack');

const context = CdkBridge.context(stack);

new RedshiftCluster(stack, 'Cluster', {
  context,
  subnetIds: ['subnet-01111111111111111', 'subnet-02222222222222222', 'subnet-03333333333333333'],
  adminPassword: 'Placeholder1!',
  encrypted: true,
  kmsKeyArn: 'arn:aws:kms:us-east-1:123456789012:key/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
});

app.synth();
