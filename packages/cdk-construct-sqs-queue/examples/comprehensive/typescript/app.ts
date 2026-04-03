import { App, Stack } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { SqsQueue } from '@sevenpico/cdk-construct-sqs-queue';

const app = new App();
const stack = new Stack(app, 'SqsQueueComprehensiveStack');

const context = makeContext({
  namespace: 'acme',
  environment: 'dev',
  stage: 'app',
  tags: { Owner: 'platform-team', CostCenter: 'engineering' },
});

new SqsQueue(stack, 'Queue', {
  context,
  visibilityTimeoutSeconds: 300,
  messageRetentionSeconds: 86400,
  dlqEnabled: true,
  sqsManagedSseEnabled: true,
});

app.synth();
