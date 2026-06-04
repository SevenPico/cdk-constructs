import { App, Stack } from 'aws-cdk-lib';
import { ContextFns } from '@sevenpico/cdk-context';

const app = new App();
new Stack(app, 'ComprehensiveContextExample');

// Build a context with all available props exercised.
const ctx = ContextFns.make({
  namespace: 'acme',
  environment: 'dev',
  stage: 'app',
  name: 'api',
  tenant: 'tenant1',
  region: 'use1',

  // Naming control
  delimiter: '-',
  labelOrder: ['namespace', 'environment', 'stage', 'name', 'attributes'],
  labelKeyCase: 'title',
  labelValueCase: 'lower',
  idLengthLimit: 32,
  attributes: ['v2'],

  // Tags
  tags: {
    CostCenter: 'engineering',
    Owner: 'platform-team',
  },
  additionalTagMap: {
    ManagedBy: 'cdk',
  },
  labelsAsTags: ['namespace', 'environment', 'stage', 'name'],
});

console.log('Context ID:    ', ContextFns.id(ctx));   // acme-dev-app-api-v2 (or truncated)
console.log('Is enabled:    ', ContextFns.isEnabled(ctx));
console.log('Tags:          ', JSON.stringify(ContextFns.tags(ctx), null, 2));

// Demonstrate context extension: add a child resource suffix.
const childCtx = ContextFns.extend(ctx, { attributes: ['worker'] });
console.log('Child ID:      ', ContextFns.id(childCtx)); // acme-dev-app-api-v2-worker

app.synth();
