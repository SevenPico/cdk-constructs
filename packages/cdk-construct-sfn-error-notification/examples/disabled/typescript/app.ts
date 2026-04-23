import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { SfnErrorNotification } from '@sevenpico/cdk-construct-sfn-error-notification';

const app = new App();
const stack = new Stack(app, 'SfnErrorNotificationDisabledStack');

// Load context with enabled: false — construct will create zero resources.
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
