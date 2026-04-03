import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { ExpressSfnErrorNotification } from '@sevenpico/cdk-construct-express-sfn-error-notification';

const app = new App();
const stack = new Stack(app, 'ExpressSfnErrorNotificationMultiTargetStack');

// Load context and platform references from CDK Bridge JSON.
const context = CdkBridge.context(stack);
const processorArn = CdkBridge.string(stack, 'processorArn');
const validatorArn = CdkBridge.string(stack, 'validatorArn');
const alarmsSnsTopicArn = CdkBridge.string(stack, 'alarmsSnsTopicArn');

new ExpressSfnErrorNotification(stack, 'ExpressSfnMonitor', {
  context,
  stepFunctions: {
    processor: { arn: processorArn },
    validator: { arn: validatorArn },
  },
  rateAlarmSnsTopicArn: alarmsSnsTopicArn,
  volumeAlarmSnsTopicArn: alarmsSnsTopicArn,
});

app.synth();
