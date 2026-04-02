import { App, Stack } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { HttpApiGateway } from '@sevenpico/cdk-construct-http-api-gateway';

const app = new App();
const stack = new Stack(app, 'HttpApiGatewayDisabledStack');

const context = makeContext({
  namespace: 'acme',
  environment: 'dev',
  stage: 'app',
  enabled: false,
});

new HttpApiGateway(stack, 'Api', { context });

app.synth();
