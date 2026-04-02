import { App, Stack } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { Secret } from '@sevenpico/cdk-construct-secret';

const app = new App();
const stack = new Stack(app, 'SecretMinimalStack');

const context = makeContext({ namespace: 'acme', environment: 'dev', stage: 'app' });

// Minimal Secret — all defaults: KMS key auto-created, no SNS
new Secret(stack, 'Secret', { context });

app.synth();
