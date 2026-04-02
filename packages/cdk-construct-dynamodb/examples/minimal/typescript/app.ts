import { App, Stack } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { Dynamodb } from '@sevenpico/cdk-construct-dynamodb';

const app = new App();
const stack = new Stack(app, 'DynamodbMinimalStack');

const context = makeContext({
  namespace: 'acme',
  environment: 'dev',
  stage: 'app',
});

new Dynamodb(stack, 'Table', {
  context,
  hashKey: 'id',
});

app.synth();
