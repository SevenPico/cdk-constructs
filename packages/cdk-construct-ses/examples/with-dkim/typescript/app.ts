import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { Ses } from '@sevenpico/cdk-construct-ses';

const app = new App();
const stack = new Stack(app, 'SesWithDkimStack');

const context = CdkBridge.context(stack);

new Ses(stack, 'Ses', {
  context,
  verifyDomain: true,
  verifyDkim: true,
  zoneId: 'Z0PUBLICZONEID00000',
  zoneName: 'dev.acme.example.com',
});

app.synth();
