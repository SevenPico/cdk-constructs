import * as path from 'path';
import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { Slackbot } from '@sevenpico/cdk-construct-slackbot';

const app = new App();
const stack = new Stack(app, 'SlackbotDisabledStack');

// enabled: false — the construct will create no resources.
const context = CdkBridge.context(stack);
const slackTokenArn = 'arn:aws:secretsmanager:us-east-1:123456789012:secret:acme/dev/app/slack-token-AbCdEf';

new Slackbot(stack, 'SlackbotConstruct', {
  context,
  slackChannels: { alerts: 'C01234ABCDE' },
  slackTokenSecretArn: slackTokenArn,
  lambdaCodePath: path.join(__dirname, 'lambda'),
});

app.synth();
