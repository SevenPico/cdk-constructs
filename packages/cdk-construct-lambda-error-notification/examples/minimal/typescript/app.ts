import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { LambdaErrorNotification } from '@sevenpico/cdk-construct-lambda-error-notification';

const app = new App();
const stack = new Stack(app, 'LambdaErrorNotificationMinimalStack');

// Load context and platform references from CDK Bridge JSON.
const context = CdkBridge.context(stack);
const lambdaArn = CdkBridge.string(stack, 'lambdaArn');
const lambdaFunctionName = CdkBridge.string(stack, 'lambdaFunctionName');
const lambdaRoleName = CdkBridge.string(stack, 'lambdaRoleName');
const alarmsSnsTopicArn = CdkBridge.string(stack, 'alarmsSnsTopicArn');

new LambdaErrorNotification(stack, 'LambdaMonitor', {
  context,
  lambdaArn,
  lambdaFunctionName,
  lambdaRoleName,
  rateAlarmSnsTopicArn: alarmsSnsTopicArn,
  volumeAlarmSnsTopicArn: alarmsSnsTopicArn,
});

app.synth();
