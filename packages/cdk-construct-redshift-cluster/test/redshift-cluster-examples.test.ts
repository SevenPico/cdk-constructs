import { makeContext } from '@sevenpico/cdk-context';
import { App, Stack } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { RedshiftCluster } from '../src';

describe('redshift-cluster examples', () => {
  test('minimal scenario creates cluster with correct tags', () => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');
    const context = makeContext({ namespace: 'acme', environment: 'dev', stage: 'app' });
    new RedshiftCluster(stack, 'Cluster', {
      context,
      subnetIds: ['subnet-0111', 'subnet-0222'],
      adminPassword: 'Placeholder1!',
    });
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::Redshift::Cluster', {
      Tags: Match.arrayWith([
        { Key: 'Environment', Value: 'dev' },
        { Key: 'Namespace', Value: 'acme' },
        { Key: 'Stage', Value: 'app' },
      ]),
    });
  });

  test('disabled scenario creates no resources', () => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');
    const context = makeContext({ namespace: 'acme', environment: 'dev', stage: 'app', enabled: false });
    new RedshiftCluster(stack, 'Cluster', {
      context,
      subnetIds: ['subnet-0111'],
      adminPassword: 'Placeholder1!',
    });
    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::Redshift::Cluster', 0);
  });
});
