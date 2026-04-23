import { App, Stack } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { SfnErrorNotification } from '@sevenpico/cdk-construct-sfn-error-notification';

const app = new App();
const stack = new Stack(app, 'SfnErrorNotificationMinimalStack');

const context = makeContext({
  namespace: 'acme',
  environment: 'dev',
  stage: 'app',
  tags: { Owner: 'platform-team', CostCenter: 'engineering' },
});
const stateMachineArn = 'arn:aws:states:us-east-1:123456789012:stateMachine:acme-dev-app-processor';
const alarmsSnsTopicArn = 'arn:aws:sns:us-east-1:123456789012:acme-dev-app-alarms';

new SfnErrorNotification(stack, 'SfnMonitor', {
  context,
  stateMachineArn,
  rateAlarmSnsTopicArn: alarmsSnsTopicArn,
  volumeAlarmSnsTopicArn: alarmsSnsTopicArn,
});

app.synth();
