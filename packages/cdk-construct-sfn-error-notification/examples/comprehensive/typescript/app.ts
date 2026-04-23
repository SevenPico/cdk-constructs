import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { SfnErrorNotification } from '@sevenpico/cdk-construct-sfn-error-notification';

const app = new App();
const stack = new Stack(app, 'SfnErrorNotificationComprehensiveStack');

// Load context and platform references from CDK Bridge JSON.
const context = CdkBridge.context(stack);
const stateMachineArn = CdkBridge.string(stack, 'stateMachineArn');
const alarmsSnsTopicArn = CdkBridge.string(stack, 'alarmsSnsTopicArn');
const kmsKeyArn = CdkBridge.string(stack, 'kmsKeyArn');

new SfnErrorNotification(stack, 'SfnMonitor', {
  context,
  stateMachineArn,
  rateAlarmSnsTopicArn: alarmsSnsTopicArn,
  volumeAlarmSnsTopicArn: alarmsSnsTopicArn,

  // KMS-encrypted DLQ
  sqsKmsKeyArn: kmsKeyArn,
  sqsQueueName: 'acme-dev-app-processor-dlq',
  sqsMessageRetentionSeconds: 1209600, // 14 days
  sqsVisibilityTimeoutSeconds: 30,

  // Alarm tuning
  alarmPeriodSeconds: 300,
  alarmEvaluationPeriods: 3,
  alarmDatapointsToAlarm: 2,
  rateAlarmName: 'acme-dev-app-processor-error-rate',
  volumeAlarmName: 'acme-dev-app-processor-error-volume',

  // EventBridge Pipe tuning
  eventbridgePipeName: 'acme-dev-app-processor-replay',
  eventbridgePipeBatchSize: 5,
  eventbridgePipeLogLevel: 'INFO',
  cloudwatchLogRetentionDays: 30,
  targetStepFunctionInputTemplate: '<$.detail.input>',

  // EventBridge rule name
  eventbridgeRuleName: 'acme-dev-app-processor-failed',
});

app.synth();
