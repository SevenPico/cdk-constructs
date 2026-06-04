import { makeContext } from '@sevenpico/cdk-context';
import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { CloudtrailCloudwatchAlarms } from '../src/cloudtrail-cloudwatch-alarms';

function makeStack(): Stack {
  const app = new App();
  return new Stack(app, 'TestStack');
}

const CONTEXT = makeContext({ namespace: 'acme', environment: 'dev', stage: 'app' });

describe('Example: minimal', () => {
  let template: Template;
  beforeAll(() => {
    const stack = makeStack();
    new CloudtrailCloudwatchAlarms(stack, 'Alarms', {
      context: CONTEXT,
      logGroupName: '/aws/cloudtrail/acme-dev-app',
      snsTopicArn: 'arn:aws:sns:us-east-1:123456789012:acme-dev-app-alerts',
    });
    template = Template.fromStack(stack);
  });
  test('creates 14 CloudWatch alarms', () => {
    template.resourceCountIs('AWS::CloudWatch::Alarm', 14);
  });
  test('creates 14 metric filters', () => {
    template.resourceCountIs('AWS::Logs::MetricFilter', 14);
  });
});

describe('Example: comprehensive', () => {
  let template: Template;
  beforeAll(() => {
    const stack = makeStack();
    new CloudtrailCloudwatchAlarms(stack, 'Alarms', {
      context: CONTEXT,
      logGroupName: '/aws/cloudtrail/acme-dev-app',
      snsTopicArn: 'arn:aws:sns:us-east-1:123456789012:acme-dev-app-alerts',
      alarmNamespace: 'AcmeSecurity',
      alarmPeriodSeconds: 60,
      enabledAlarms: ['unauthorized-api', 'root-usage', 'iam-policy-changes', 'cloudtrail-changes'],
    });
    template = Template.fromStack(stack);
  });
  test('creates only the 4 enabled alarms', () => {
    template.resourceCountIs('AWS::CloudWatch::Alarm', 4);
  });
  test('creates only 4 metric filters', () => {
    template.resourceCountIs('AWS::Logs::MetricFilter', 4);
  });
  test('uses custom alarm namespace', () => {
    template.hasResourceProperties('AWS::CloudWatch::Alarm', {
      Namespace: 'AcmeSecurity',
    });
  });
});

describe('Example: disabled', () => {
  let template: Template;
  beforeAll(() => {
    const stack = makeStack();
    new CloudtrailCloudwatchAlarms(stack, 'Alarms', {
      context: makeContext({ namespace: 'acme', environment: 'dev', stage: 'app', enabled: false }),
      logGroupName: '/aws/cloudtrail/acme-dev-app',
      snsTopicArn: 'arn:aws:sns:us-east-1:123456789012:acme-dev-app-alerts',
    });
    template = Template.fromStack(stack);
  });
  test('creates zero alarms when disabled', () => {
    template.resourceCountIs('AWS::CloudWatch::Alarm', 0);
  });
  test('creates zero metric filters when disabled', () => {
    template.resourceCountIs('AWS::Logs::MetricFilter', 0);
  });
});
