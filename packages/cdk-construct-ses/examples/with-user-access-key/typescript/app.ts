import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { Ses } from '@sevenpico/cdk-construct-ses';

const app = new App();
const stack = new Stack(app, 'SesWithUserAccessKeyStack');

const context = CdkBridge.context(stack);

new Ses(stack, 'Ses', {
  context,
  sesUserEnabled: true,
  createIamAccessKey: true,
});

app.synth();
