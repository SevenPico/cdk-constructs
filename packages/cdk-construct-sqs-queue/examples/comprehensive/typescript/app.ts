import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { SqsQueue } from '@sevenpico/cdk-construct-sqs-queue';

const app = new App();
const stack = new Stack(app, 'SqsQueueComprehensiveStack');

const context = CdkBridge.context(stack);

new SqsQueue(stack, 'Queue', {
  context,
  visibilityTimeoutSeconds: 300,
  messageRetentionSeconds: 86400,
  dlqEnabled: true,
  sqsManagedSseEnabled: true,
});

app.synth();
