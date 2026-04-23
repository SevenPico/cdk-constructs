import { App, Stack } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { ExpressSfnErrorNotification } from '@sevenpico/cdk-construct-express-sfn-error-notification';

const app = new App();
const stack = new Stack(app, 'ExpressSfnErrorNotificationComprehensiveStack');

const context = makeContext({
  namespace: 'acme',
  environment: 'dev',
  stage: 'app',
  tags: { Owner: 'platform-team', CostCenter: 'engineering' },
});
const processorArn = 'arn:aws:states:us-east-1:123456789012:stateMachine:acme-dev-app-processor';
const alarmsSnsTopicArn = 'arn:aws:sns:us-east-1:123456789012:acme-dev-app-alarms';
const kmsKeyArn = 'arn:aws:kms:us-east-1:123456789012:key/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const kmsKeyId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

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
