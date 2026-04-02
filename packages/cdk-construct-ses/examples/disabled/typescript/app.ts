import { App, Stack } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { Ses } from '@sevenpico/cdk-construct-ses';

const app = new App();
const stack = new Stack(app, 'SesDisabledStack');

const context = makeContext({
  namespace: 'acme',
  environment: 'dev',
  stage: 'app',
  enabled: false,
});

new Ses(stack, 'Ses', { context });

app.synth();
