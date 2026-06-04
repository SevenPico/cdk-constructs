import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { EventbridgeRule } from '@sevenpico/cdk-construct-eventbridge-rule';

const app = new App();
const stack = new Stack(app, 'EventbridgeRuleMinimalStack');

const context = CdkBridge.context(stack);

new EventbridgeRule(stack, 'Rule', {
  context,
  eventPattern: { source: ['acme.app'] },
  targetArn: 'arn:aws:sqs:us-east-1:123456789012:acme-dev-app',
});

app.synth();
