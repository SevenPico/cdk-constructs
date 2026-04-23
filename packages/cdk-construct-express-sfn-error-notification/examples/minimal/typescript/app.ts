import { App, Stack } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { ExpressSfnErrorNotification } from '@sevenpico/cdk-construct-express-sfn-error-notification';

const app = new App();
const stack = new Stack(app, 'ExpressSfnErrorNotificationMinimalStack');

const context = makeContext({
  namespace: 'acme',
  environment: 'dev',
  stage: 'app',
  tags: { Owner: 'platform-team', CostCenter: 'engineering' },
});
const processorArn = 'arn:aws:states:us-east-1:123456789012:stateMachine:acme-dev-app-processor';
const alarmsSnsTopicArn = 'arn:aws:sns:us-east-1:123456789012:acme-dev-app-alarms';

new ExpressSfnErrorNotification(stack, 'ExpressSfnMonitor', {
  context,
  stepFunctions: {
    processor: { arn: processorArn },
  },
  rateAlarmSnsTopicArn: alarmsSnsTopicArn,
  volumeAlarmSnsTopicArn: alarmsSnsTopicArn,
});

app.synth();
