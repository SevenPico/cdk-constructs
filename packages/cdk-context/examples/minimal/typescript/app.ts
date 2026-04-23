import { App, Stack } from 'aws-cdk-lib';
import { ContextFns } from '@sevenpico/cdk-context';

const app = new App();
new Stack(app, 'MinimalContextExample');

// Build a context with required props only: namespace, environment, stage.
// The computed ID follows the default label order: namespace-environment-stage.
const ctx = ContextFns.make({
  namespace: 'acme',
  environment: 'dev',
  stage: 'app',
});

console.log('Context ID:  ', ContextFns.id(ctx));   // acme-dev-app
console.log('Is enabled:  ', ContextFns.isEnabled(ctx)); // true
console.log('Tags:        ', JSON.stringify(ContextFns.tags(ctx), null, 2));

app.synth();
