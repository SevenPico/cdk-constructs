import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { SfnErrorNotification } from '@sevenpico/cdk-construct-sfn-error-notification';

const app = new App();
const stack = new Stack(app, 'SfnErrorNotificationMinimalStack');

// Load context and platform references from CDK Bridge JSON.
const context = CdkBridge.context(stack);
const stateMachineArn = CdkBridge.string(stack, 'stateMachineArn');
const alarmsSnsTopicArn = CdkBridge.string(stack, 'alarmsSnsTopicArn');

new SfnErrorNotification(stack, 'SfnMonitor', {
  context,
  stateMachineArn,
  rateAlarmSnsTopicArn: alarmsSnsTopicArn,
  volumeAlarmSnsTopicArn: alarmsSnsTopicArn,
});

app.synth();
