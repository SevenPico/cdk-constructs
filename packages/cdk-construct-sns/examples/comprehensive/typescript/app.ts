import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { Sns } from '@sevenpico/cdk-construct-sns';

const app = new App();
const stack = new Stack(app, 'SnsComprehensiveStack');

const context = CdkBridge.context(stack);

new Sns(stack, 'Topic', {
  context,
  encryptionEnabled: true,
  allowedAwsServicesForPublish: ['events.amazonaws.com'],
  sqsDlqEnabled: true,
});

app.synth();
