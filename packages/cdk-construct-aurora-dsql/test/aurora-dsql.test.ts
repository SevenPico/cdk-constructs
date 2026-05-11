import { makeContext } from '@sevenpico/cdk-context';
import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { AuroraDsql } from '../src/aurora-dsql';

describe('AuroraDsql construct', () => {
  test('creates RDS cluster with default settings', () => {
    const app = new App();
    const stack = new Stack(app, 'Test');
    const context = makeContext({ namespace: '7p', stage: 'test', name: 'dsql' });

    new AuroraDsql(stack, 'AuroraDsql', {
      context,
      masterPassword: 'TestPassword123!',
    });

    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::RDS::DBCluster', 1);
    template.hasResourceProperties('AWS::RDS::DBCluster', {
      Engine: 'aurora-mysql',
      DatabaseName: 'nowcuisine',
    });
  });

  test('creates no resources when disabled', () => {
    const app = new App();
    const stack = new Stack(app, 'Test');

    new AuroraDsql(stack, 'AuroraDsql', {
      context: makeContext({
        namespace: '7p',
        stage: 'test',
        name: 'dsql',
        enabled: false,
      }),
      masterPassword: 'TestPassword123!',
    });

    const template = Template.fromStack(stack);
    expect(Object.keys(template.toJSON().Resources ?? {})).toHaveLength(0);
  });

  test('exposes clusterArn property', () => {
    const app = new App();
    const stack = new Stack(app, 'Test');
    const context = makeContext({ namespace: '7p', stage: 'test', name: 'dsql' });

    const dsql = new AuroraDsql(stack, 'AuroraDsql', {
      context,
      masterPassword: 'TestPassword123!',
    });

    expect(dsql.clusterArn).toBeDefined();
  });

  test('exposes clusterEndpoint property', () => {
    const app = new App();
    const stack = new Stack(app, 'Test');
    const context = makeContext({ namespace: '7p', stage: 'test', name: 'dsql' });

    const dsql = new AuroraDsql(stack, 'AuroraDsql', {
      context,
      masterPassword: 'TestPassword123!',
    });

    expect(dsql.clusterEndpoint).toBeDefined();
  });

  test('uses custom database name', () => {
    const app = new App();
    const stack = new Stack(app, 'Test');
    const context = makeContext({ namespace: '7p', stage: 'test', name: 'dsql' });

    new AuroraDsql(stack, 'AuroraDsql', {
      context,
      masterPassword: 'TestPassword123!',
      databaseName: 'customdb',
    });

    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::RDS::DBCluster', {
      DatabaseName: 'customdb',
    });
  });

  test('uses custom master username', () => {
    const app = new App();
    const stack = new Stack(app, 'Test');
    const context = makeContext({ namespace: '7p', stage: 'test', name: 'dsql' });

    new AuroraDsql(stack, 'AuroraDsql', {
      context,
      masterPassword: 'TestPassword123!',
      masterUsername: 'admin',
    });

    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::RDS::DBCluster', {
      MasterUsername: 'admin',
    });
  });
});
