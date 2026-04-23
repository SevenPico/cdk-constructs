import { App, Stack } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { S3LogStorage } from '@sevenpico/cdk-construct-s3-log-storage';

const app = new App();
const stack = new Stack(app, 'S3LogStorageMinimalStack');

const context = makeContext({
  namespace: 'acme',
  environment: 'dev',
  stage: 'app',
  tags: { Owner: 'platform-team', CostCenter: 'engineering' },
});

new S3LogStorage(stack, 'LogStorage', {
  context,
});

app.synth();
