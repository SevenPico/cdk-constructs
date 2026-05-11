import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { Secret } from '@sevenpico/cdk-construct-secret';

const app = new App();
const stack = new Stack(app, 'SecretDisabledStack');

// enabled: false — construct creates no resources
const context = CdkBridge.context(stack);

new Secret(stack, 'Secret', { context });

app.synth();
