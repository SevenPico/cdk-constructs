import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { Eventbridge } from '@sevenpico/cdk-construct-eventbridge';

const app = new App();
const stack = new Stack(app, 'EventbridgeMinimalStack');

const context = CdkBridge.context(stack);

new Eventbridge(stack, 'Bus', { context });

app.synth();
