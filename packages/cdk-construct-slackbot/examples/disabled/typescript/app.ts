import * as path from 'path';
import { App, Stack } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { Slackbot } from '@sevenpico/cdk-construct-slackbot';

const app = new App();
const stack = new Stack(app, 'SlackbotDisabledStack');

// enabled: false — the construct will create no resources.
const context = makeContext({
  namespace: 'acme',
  environment: 'dev',
  stage: 'app',
  enabled: false,
});
const slackTokenArn = 'arn:aws:secretsmanager:us-east-1:123456789012:secret:acme/dev/app/slack-token-AbCdEf';

new Slackbot(stack, 'SlackbotConstruct', {
  context,
  slackChannels: { alerts: 'C01234ABCDE' },
  slackTokenSecretArn: slackTokenArn,
  lambdaCodePath: path.join(__dirname, 'lambda'),
});

app.synth();
