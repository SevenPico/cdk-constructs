import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { Dynamodb } from '@sevenpico/cdk-construct-dynamodb';

const app = new App();
const stack = new Stack(app, 'DynamodbMinimalStack');

const context = CdkBridge.context(stack);

new Dynamodb(stack, 'Table', {
  context,
  hashKey: 'id',
});

app.synth();
