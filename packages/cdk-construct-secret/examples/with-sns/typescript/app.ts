import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { Secret } from '@sevenpico/cdk-construct-secret';

const app = new App();
const stack = new Stack(app, 'SecretWithSnsStack');

const context = CdkBridge.context(stack);

app.synth();
