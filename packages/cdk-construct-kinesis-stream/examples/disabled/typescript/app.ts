import { App, Stack } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { KinesisStream } from '@sevenpico/cdk-construct-kinesis-stream';

const app = new App();
const stack = new Stack(app, 'KinesisStreamDisabledStack');

const context = makeContext({
  namespace: 'acme',
  environment: 'dev',
  stage: 'app',
  enabled: false,
});

new KinesisStream(stack, 'Stream', { context });

app.synth();
