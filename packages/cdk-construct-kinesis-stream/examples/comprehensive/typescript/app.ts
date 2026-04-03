import { App, Stack } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { KinesisStream } from '@sevenpico/cdk-construct-kinesis-stream';

const app = new App();
const stack = new Stack(app, 'KinesisStreamComprehensiveStack');

const context = makeContext({
  namespace: 'acme',
  environment: 'dev',
  stage: 'app',
});

new KinesisStream(stack, 'Stream', {
  context,
  shardCount: 2,
  retentionPeriodHours: 48,
  streamMode: 'PROVISIONED',
  encryptionType: 'KMS',
  consumerCount: 1,
});

app.synth();
