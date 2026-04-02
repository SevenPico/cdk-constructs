import { App, Stack } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { Ses } from '@sevenpico/cdk-construct-ses';

const app = new App();
const stack = new Stack(app, 'SesWithUserAccessKeyStack');

const context = makeContext({
  namespace: 'acme',
  environment: 'dev',
  stage: 'app',
});

new Ses(stack, 'Ses', {
  context,
  sesUserEnabled: true,
  createIamAccessKey: true,
});

app.synth();
