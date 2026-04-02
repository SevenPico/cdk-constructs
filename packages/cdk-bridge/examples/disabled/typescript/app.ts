import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';

const app = new App();
const stack = new Stack(app, 'DisabledBridgeExample');

// Read Context from bridge fixture — enabled:false is set in the fixture.
const ctx = CdkBridge.context(stack);
console.log('Context ID:  ', ctx.id);
console.log('Is enabled:  ', ctx.enabled); // false

// Guard: skip resource creation when context is disabled.
if (!ctx.enabled) {
  console.log('Context is disabled — skipping resource creation.');
} else {
  const vpcId = CdkBridge.string(stack, 'vpcId');
  console.log('VPC ID:      ', vpcId);
}

app.synth();
