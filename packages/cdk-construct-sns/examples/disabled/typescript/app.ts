import { App, Stack } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { Sns } from '@sevenpico/cdk-construct-sns';

const app = new App();
const stack = new Stack(app, 'SnsDisabledStack');

const context = makeContext({
  namespace: 'acme',
  environment: 'dev',
  stage: 'app',
  enabled: false,
});

new Sns(stack, 'Topic', { context });

app.synth();
