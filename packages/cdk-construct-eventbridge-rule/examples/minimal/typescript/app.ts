import { App, Stack } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { EventbridgeRule } from '@sevenpico/cdk-construct-eventbridge-rule';

const app = new App();
const stack = new Stack(app, 'EventbridgeRuleMinimalStack');

const context = makeContext({
  namespace: 'acme',
  environment: 'dev',
  stage: 'app',
});

new EventbridgeRule(stack, 'Rule', {
  context,
  eventPattern: { source: ['acme.app'] },
  targetArn: 'arn:aws:sqs:us-east-1:123456789012:acme-dev-app',
});

app.synth();
