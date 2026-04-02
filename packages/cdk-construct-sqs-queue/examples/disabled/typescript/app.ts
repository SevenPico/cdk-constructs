import { App, Stack } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { SqsQueue } from '@sevenpico/cdk-construct-sqs-queue';

const app = new App();
const stack = new Stack(app, 'SqsQueueDisabledStack');

const context = makeContext({
  namespace: 'acme',
  environment: 'dev',
  stage: 'app',
  enabled: false,
});

new SqsQueue(stack, 'Queue', { context });

app.synth();
