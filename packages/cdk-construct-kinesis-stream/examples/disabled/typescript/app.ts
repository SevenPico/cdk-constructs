import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { KinesisStream } from '@sevenpico/cdk-construct-kinesis-stream';

const app = new App();
const stack = new Stack(app, 'KinesisStreamDisabledStack');

const context = CdkBridge.context(stack);

new KinesisStream(stack, 'Stream', { context });

app.synth();
