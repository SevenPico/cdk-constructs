import { App, Stack } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { Sns } from '@sevenpico/cdk-construct-sns';

const app = new App();
const stack = new Stack(app, 'SnsComprehensiveStack');

const context = makeContext({
  namespace: 'acme',
  environment: 'dev',
  stage: 'app',
});

new Sns(stack, 'Topic', {
  context,
  encryptionEnabled: true,
  allowedAwsServicesForPublish: ['events.amazonaws.com'],
  sqsDlqEnabled: true,
});

app.synth();
