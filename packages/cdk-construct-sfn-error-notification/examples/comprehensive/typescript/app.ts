import { App, Stack } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { SfnErrorNotification } from '@sevenpico/cdk-construct-sfn-error-notification';

const app = new App();
const stack = new Stack(app, 'SfnErrorNotificationComprehensiveStack');

const context = makeContext({
  namespace: 'acme',
  environment: 'dev',
  stage: 'app',
  tags: { Owner: 'platform-team', CostCenter: 'engineering' },
});
const stateMachineArn = 'arn:aws:states:us-east-1:123456789012:stateMachine:acme-dev-app-processor';
const alarmsSnsTopicArn = 'arn:aws:sns:us-east-1:123456789012:acme-dev-app-alarms';
const kmsKeyArn = 'arn:aws:kms:us-east-1:123456789012:key/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

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
