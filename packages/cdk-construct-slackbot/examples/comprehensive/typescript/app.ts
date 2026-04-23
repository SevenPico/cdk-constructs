import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { Slackbot } from '@sevenpico/cdk-construct-slackbot';

const app = new App();
const stack = new Stack(app, 'SlackbotComprehensiveStack');

// Load context and platform references from CDK Bridge JSON.
const context = CdkBridge.context(stack);
const slackTokenArn = CdkBridge.string(stack, 'slackTokenArn');
const secretsKmsKeyArn = CdkBridge.string(stack, 'secretsKmsKeyArn');

new Slackbot(stack, 'SlackbotConstruct', {
  context,

  // Multiple Slack channels: SNS attribute name → Slack channel ID
  slackChannels: {
    alerts: 'C01234ABCDE',
    deployments: 'C09876ZYXWV',
    incidents: 'C0INCIDENT0',
  },

  slackTokenSecretArn: slackTokenArn,
  slackTokenSecretKmsKeyArn: secretsKmsKeyArn,

  // Custom Lambda deployment package
  lambdaCodePath: './lambda',
  lambdaRuntime: 'python3.11',

  // Custom CloudWatch log retention (30 days instead of default 90)
  cloudwatchLogExpirationDays: 30,

  // Allow CloudWatch Alarms service to publish notifications
  snsPubPrincipals: {
    Service: ['cloudwatch.amazonaws.com', 'events.amazonaws.com'],
  },

  // Allow specific IAM role to subscribe
  snsSubPrincipals: {
    AWS: ['arn:aws:iam::123456789012:role/acme-dev-app-ops-role'],
  },
});

app.synth();
