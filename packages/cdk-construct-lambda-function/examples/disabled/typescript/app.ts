import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { LambdaFunction } from '@sevenpico/cdk-construct-lambda-function';

const app = new App();
const stack = new Stack(app, 'LambdaFunctionDisabledStack');

const context = CdkBridge.context(stack);

new LambdaFunction(stack, 'Fn', {
  context,
  runtime: 'nodejs20.x',
  handler: 'index.handler',
  s3Bucket: 'acme-dev-app-lambda-artifacts',
  s3Key: 'functions/my-function.zip',
});

app.synth();
