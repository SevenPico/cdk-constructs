import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { LambdaErrorNotification } from '@sevenpico/cdk-construct-lambda-error-notification';

const app = new App();
const stack = new Stack(app, 'LambdaErrorNotificationComprehensiveStack');

// Load context and platform references from CDK Bridge JSON.
const context = CdkBridge.context(stack);
const lambdaArn = CdkBridge.string(stack, 'lambdaArn');
const lambdaFunctionName = CdkBridge.string(stack, 'lambdaFunctionName');
const lambdaRoleName = CdkBridge.string(stack, 'lambdaRoleName');
const alarmsSnsTopicArn = CdkBridge.string(stack, 'alarmsSnsTopicArn');
const kmsKeyArn = CdkBridge.string(stack, 'kmsKeyArn');
const kmsKeyId = CdkBridge.string(stack, 'kmsKeyId');

new LambdaErrorNotification(stack, 'LambdaMonitor', {
  context,
  lambdaArn,
  lambdaFunctionName,
  lambdaRoleName,
  rateAlarmSnsTopicArn: alarmsSnsTopicArn,
  volumeAlarmSnsTopicArn: alarmsSnsTopicArn,

  // KMS-encrypted DLQ
  sqsKmsConfig: { keyId: kmsKeyId, keyArn: kmsKeyArn },
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
  targetLambdaInputTemplate: '<$.requestPayload>',
});

app.synth();
