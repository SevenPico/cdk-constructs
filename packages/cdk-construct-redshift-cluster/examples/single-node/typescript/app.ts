import { App, Stack } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { RedshiftCluster } from '@sevenpico/cdk-construct-redshift-cluster';

const app = new App();
const stack = new Stack(app, 'RedshiftClusterSingleNodeStack');

const context = makeContext({
  namespace: 'acme',
  environment: 'dev',
  stage: 'app',
});

new RedshiftCluster(stack, 'Cluster', {
  context,
  subnetIds: ['subnet-01111111111111111', 'subnet-02222222222222222', 'subnet-03333333333333333'],
  adminPassword: 'Placeholder1!',
  clusterType: 'single-node',
});

app.synth();
