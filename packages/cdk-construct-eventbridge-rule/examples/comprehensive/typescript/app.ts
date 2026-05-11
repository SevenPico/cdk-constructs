import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { EventbridgeRule } from '@sevenpico/cdk-construct-eventbridge-rule';

const app = new App();
const stack = new Stack(app, 'EventbridgeRuleComprehensiveStack');

const context = CdkBridge.context(stack);

new EventbridgeRule(stack, 'Rule', {
  context,
  description: 'Route acme.app order events to processing queue',
  eventPattern: {
    source: ['acme.app'],
    'detail-type': ['OrderPlaced'],
  },
  targetArn: 'arn:aws:sqs:us-east-1:123456789012:acme-dev-app-orders',
  ruleEnabled: true,
  sourceEventBusName: 'acme-dev-app-events',
});

app.synth();
