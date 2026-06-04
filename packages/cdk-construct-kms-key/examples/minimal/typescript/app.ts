import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { KmsKey } from '@sevenpico/cdk-construct-kms-key';

const app = new App();
const stack = new Stack(app, 'KmsKeyMinimalStack');

const context = CdkBridge.context(stack);

new KmsKey(stack, 'Key', { context });

app.synth();
