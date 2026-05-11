import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { Secret } from '@sevenpico/cdk-construct-secret';

const app = new App();
const stack = new Stack(app, 'SecretMinimalStack');

const context = CdkBridge.context(stack);

// Minimal Secret — all defaults: KMS key auto-created, no SNS
new Secret(stack, 'Secret', { context });

app.synth();
