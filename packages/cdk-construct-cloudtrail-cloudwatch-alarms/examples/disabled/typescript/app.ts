import { App, Stack } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { CloudtrailCloudwatchAlarms } from '@sevenpico/cdk-construct-cloudtrail-cloudwatch-alarms';

const app = new App();
const stack = new Stack(app, 'CloudtrailCloudwatchAlarmsDisabledStack');

const context = makeContext({
  namespace: 'acme',
  environment: 'dev',
  stage: 'app',
  enabled: false,
});

new CloudtrailCloudwatchAlarms(stack, 'Alarms', {
  context,
  logGroupName: '/aws/cloudtrail/acme-dev-app',
  snsTopicArn: 'arn:aws:sns:us-east-1:123456789012:acme-dev-app-alerts',
});

app.synth();
