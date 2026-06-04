import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { CloudtrailCloudwatchAlarms } from '@sevenpico/cdk-construct-cloudtrail-cloudwatch-alarms';

const app = new App();
const stack = new Stack(app, 'CloudtrailCloudwatchAlarmsComprehensiveStack');

const context = CdkBridge.context(stack);

new CloudtrailCloudwatchAlarms(stack, 'Alarms', {
  context,
  logGroupName: '/aws/cloudtrail/acme-dev-app',
  snsTopicArn: 'arn:aws:sns:us-east-1:123456789012:acme-dev-app-alerts',
  alarmNamespace: 'AcmeSecurity',
  alarmPeriodSeconds: 60,
  alarmEvaluationPeriods: 1,
  alarmThreshold: 1,
  enabledAlarms: ['unauthorized-api', 'root-usage', 'iam-policy-changes', 'cloudtrail-changes'],
});

app.synth();
