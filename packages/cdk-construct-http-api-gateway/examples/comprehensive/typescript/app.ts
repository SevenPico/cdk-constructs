import { App, Stack } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { HttpApiGateway } from '@sevenpico/cdk-construct-http-api-gateway';

const app = new App();
const stack = new Stack(app, 'HttpApiGatewayComprehensiveStack');

const context = makeContext({
  namespace: 'acme',
  environment: 'dev',
  stage: 'app',
  tags: { Owner: 'platform-team', CostCenter: 'engineering' },
});

new HttpApiGateway(stack, 'Api', {
  context,
  description: 'Acme HTTP API',
  enableAutoDeploy: true,
  cloudwatchLogsRetentionDays: 30,
  corsConfiguration: {
    allowOrigins: ['https://acme.example.com'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization'],
    maxAge: 300,
  },
  integrations: {
    lambda: {
      type: 'AWS_PROXY',
      uri: 'arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:123456789012:function:acme-dev-app/invocations',
      payloadFormatVersion: '2.0',
    },
  },
  routes: {
    getItems: {
      routeKey: 'GET /items',
      integrationKey: 'lambda',
      operationName: 'GetItems',
    },
    postItem: {
      routeKey: 'POST /items',
      integrationKey: 'lambda',
      operationName: 'PostItem',
    },
  },
  stageVariables: {
    env: 'dev',
  },
});

app.synth();
