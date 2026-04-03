import { App, Stack } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { Secret } from '@sevenpico/cdk-construct-secret';

const app = new App();
const stack = new Stack(app, 'SecretDisabledStack');

// enabled: false — construct creates no resources
const context = makeContext({ namespace: 'acme', environment: 'dev', stage: 'app', enabled: false });

new Secret(stack, 'Secret', { context });

app.synth();
