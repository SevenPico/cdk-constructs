import { App, Stack } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { Eventbridge } from '@sevenpico/cdk-construct-eventbridge';

const app = new App();
const stack = new Stack(app, 'EventbridgeMinimalStack');

const context = makeContext({
  namespace: 'acme',
  environment: 'dev',
  stage: 'app',
});

new Eventbridge(stack, 'Bus', { context });

app.synth();
