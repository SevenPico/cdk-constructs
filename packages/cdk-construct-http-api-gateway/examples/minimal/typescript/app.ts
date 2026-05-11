import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { HttpApiGateway } from '@sevenpico/cdk-construct-http-api-gateway';

const app = new App();
const stack = new Stack(app, 'HttpApiGatewayMinimalStack');

const context = CdkBridge.context(stack);

new HttpApiGateway(stack, 'Api', { context });

app.synth();
