import { App, Stack } from 'aws-cdk-lib';
import { ContextFns } from '@sevenpico/cdk-context';

const app = new App();
const stack = new Stack(app, 'DisabledContextExample');

// Build a disabled context. All constructs that receive this context will skip
// resource creation — mirroring Terraform's `count = 0` pattern.
const ctx = ContextFns.make({
  namespace: 'acme',
  environment: 'dev',
  stage: 'app',
  enabled: false,
});

console.log('Context ID:  ', ContextFns.id(ctx));
console.log('Is enabled:  ', ContextFns.isEnabled(ctx)); // false

// Extending a disabled context keeps enabled=false — the disabled flag is sticky.
const childCtx = ContextFns.extend(ctx, { attributes: ['worker'], enabled: true });
console.log('Child enabled:', ContextFns.isEnabled(childCtx)); // still false

app.synth();
