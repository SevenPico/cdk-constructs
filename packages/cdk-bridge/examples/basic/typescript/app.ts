import { App, Stack, CfnOutput } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';

const app = new App();
const stack = new Stack(app, 'BasicBridgeExample');

// Read Context labels from the bridge fixture (sevenpico context key).
const ctx = CdkBridge.context(stack);
console.log('Context ID:  ', ctx.id);          // acme-dev-app
console.log('Is enabled:  ', ctx.enabled);     // true

// Read a single Platform output — vpcId — as a string.
const vpcId = CdkBridge.string(stack, 'vpcId');
console.log('VPC ID:      ', vpcId);

new CfnOutput(stack, 'ContextId', { value: ctx.id });
new CfnOutput(stack, 'VpcId',     { value: vpcId });

app.synth();
