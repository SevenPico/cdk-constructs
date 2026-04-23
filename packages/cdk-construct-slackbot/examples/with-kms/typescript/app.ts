import * as path from 'path';
import { App, Stack } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { Slackbot } from '@sevenpico/cdk-construct-slackbot';

const app = new App();
const stack = new Stack(app, 'SlackbotWithKmsStack');

const context = makeContext({
  namespace: 'acme',
  environment: 'dev',
  stage: 'app',
  tags: { Owner: 'platform-team', CostCenter: 'engineering' },
});
const slackTokenArn = 'arn:aws:secretsmanager:us-east-1:123456789012:secret:acme/dev/app/slack-token-AbCdEf';
const secretsKmsKeyArn = 'arn:aws:kms:us-east-1:123456789012:key/cccccccc-dddd-eeee-ffff-000000000000';

new Slackbot(stack, 'SlackbotConstruct', {
  context,
  slackChannels: { alerts: 'C01234ABCDE' },
  slackTokenSecretArn: slackTokenArn,
  slackTokenSecretKmsKeyArn: secretsKmsKeyArn,
  lambdaCodePath: path.join(__dirname, 'lambda'),
});

app.synth();
