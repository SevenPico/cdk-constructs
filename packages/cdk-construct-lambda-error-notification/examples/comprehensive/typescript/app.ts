import { App, Stack } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { LambdaErrorNotification } from '@sevenpico/cdk-construct-lambda-error-notification';

const app = new App();
const stack = new Stack(app, 'LambdaErrorNotificationComprehensiveStack');

const context = makeContext({
  namespace: 'acme',
  environment: 'dev',
  stage: 'app',
  tags: { Owner: 'platform-team', CostCenter: 'engineering' },
});
const lambdaArn = 'arn:aws:lambda:us-east-1:123456789012:function:acme-dev-app-processor';
const lambdaFunctionName = 'acme-dev-app-processor';
const lambdaRoleName = 'acme-dev-app-processor-role';
const alarmsSnsTopicArn = 'arn:aws:sns:us-east-1:123456789012:acme-dev-app-alarms';
const kmsKeyArn = 'arn:aws:kms:us-east-1:123456789012:key/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const kmsKeyId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

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
