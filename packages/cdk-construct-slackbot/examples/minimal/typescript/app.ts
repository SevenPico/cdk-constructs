import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { Slackbot } from '@sevenpico/cdk-construct-slackbot';

const app = new App();
const stack = new Stack(app, 'SlackbotMinimalStack');

// Load context and platform references from CDK Bridge JSON.
const context = CdkBridge.context(stack);
const slackTokenArn = CdkBridge.string(stack, 'slackTokenArn');

new Slackbot(stack, 'SlackbotConstruct', {
  context,
  slackChannels: { alerts: 'C01234ABCDE' },
  slackTokenSecretArn: slackTokenArn,
  lambdaCodePath: './lambda',
});

app.synth();
