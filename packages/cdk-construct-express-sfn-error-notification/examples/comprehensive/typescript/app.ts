import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { ExpressSfnErrorNotification } from '@sevenpico/cdk-construct-express-sfn-error-notification';

const app = new App();
const stack = new Stack(app, 'ExpressSfnErrorNotificationComprehensiveStack');

// Load context and platform references from CDK Bridge JSON.
const context = CdkBridge.context(stack);
const processorArn = CdkBridge.string(stack, 'processorArn');
const alarmsSnsTopicArn = CdkBridge.string(stack, 'alarmsSnsTopicArn');
const kmsKeyArn = CdkBridge.string(stack, 'kmsKeyArn');
const kmsKeyId = CdkBridge.string(stack, 'kmsKeyId');

new ExpressSfnErrorNotification(stack, 'ExpressSfnMonitor', {
  context,
  stepFunctions: {
    processor: {
      arn: processorArn,
      sqsQueueName: 'acme-dev-app-processor-dlq',
      rateAlarmName: 'acme-dev-app-processor-error-rate',
      volumeAlarmName: 'acme-dev-app-processor-error-volume',
    },
  },
  rateAlarmSnsTopicArn: alarmsSnsTopicArn,
  volumeAlarmSnsTopicArn: alarmsSnsTopicArn,

  // KMS-encrypted DLQs
  sqsKmsConfig: { keyId: kmsKeyId, keyArn: kmsKeyArn },
  sqsMessageRetentionSeconds: 1209600, // 14 days
  sqsVisibilityTimeoutSeconds: 60,

  // Alarm tuning
  alarmPeriodSeconds: 300,
  alarmEvaluationPeriods: 3,
  alarmDatapointsToAlarm: 2,

  // EventBridge Pipe tuning
  eventbridgePipeBatchSize: 5,
  eventbridgePipeLogLevel: 'INFO',
  cloudwatchLogRetentionDays: 30,
  targetStepFunctionInputTemplate: '<$.detail.input>',
});

app.synth();
