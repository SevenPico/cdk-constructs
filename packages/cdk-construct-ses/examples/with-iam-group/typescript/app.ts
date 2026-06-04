import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { Ses } from '@sevenpico/cdk-construct-ses';

const app = new App();
const stack = new Stack(app, 'SesWithIamGroupStack');

const context = CdkBridge.context(stack);

new Ses(stack, 'Ses', {
  context,
  sesGroupEnabled: true,
  sesGroupName: 'ses-senders',
});

app.synth();
