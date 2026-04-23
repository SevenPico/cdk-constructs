import { App, Stack } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { LambdaErrorNotification } from '@sevenpico/cdk-construct-lambda-error-notification';

const app = new App();
const stack = new Stack(app, 'LambdaErrorNotificationMinimalStack');

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

new LambdaErrorNotification(stack, 'LambdaMonitor', {
  context,
  lambdaArn,
  lambdaFunctionName,
  lambdaRoleName,
  rateAlarmSnsTopicArn: alarmsSnsTopicArn,
  volumeAlarmSnsTopicArn: alarmsSnsTopicArn,
});

app.synth();
