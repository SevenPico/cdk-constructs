import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { SqsQueue } from '@sevenpico/cdk-construct-sqs-queue';

const app = new App();
const stack = new Stack(app, 'SqsQueueMinimalStack');

const context = CdkBridge.context(stack);

new SqsQueue(stack, 'Queue', { context });

app.synth();
