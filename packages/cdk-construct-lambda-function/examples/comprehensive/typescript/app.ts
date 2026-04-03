import { App, Stack } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { LambdaFunction } from '@sevenpico/cdk-construct-lambda-function';

const app = new App();
const stack = new Stack(app, 'LambdaFunctionComprehensiveStack');

const context = makeContext({
  namespace: 'acme',
  environment: 'dev',
  stage: 'app',
  tags: { Owner: 'platform-team', CostCenter: 'engineering' },
});

new LambdaFunction(stack, 'Fn', {
  context,
  runtime: 'nodejs20.x',
  handler: 'index.handler',
  s3Bucket: 'acme-dev-app-lambda-artifacts',
  s3Key: 'functions/my-function.zip',
  description: 'Acme data processing function',
  memorySizeMb: 512,
  timeoutSeconds: 30,
  architecture: 'arm64',
  tracingMode: 'Active',
  lambdaInsightsEnabled: true,
  cloudwatchLogsRetentionDays: 30,
  reservedConcurrentExecutions: 10,
  environment: {
    variables: {
      LOG_LEVEL: 'INFO',
      STAGE: 'dev',
    },
  },
  ssmParameterNames: ['/acme/dev/app/db-url'],
});

app.synth();
