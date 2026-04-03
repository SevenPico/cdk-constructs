import { App, Stack } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { LambdaFunction } from '@sevenpico/cdk-construct-lambda-function';

const app = new App();
const stack = new Stack(app, 'LambdaFunctionMinimalStack');

const context = makeContext({
  namespace: 'acme',
  environment: 'dev',
  stage: 'app',
});

new LambdaFunction(stack, 'Fn', {
  context,
  runtime: 'nodejs20.x',
  handler: 'index.handler',
  s3Bucket: 'acme-dev-app-lambda-artifacts',
  s3Key: 'functions/my-function.zip',
});

app.synth();
