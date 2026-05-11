import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { StepFunctions } from '@sevenpico/cdk-construct-step-functions';

const app = new App();
const stack = new Stack(app, 'StepFunctionsDisabledStack');

const context = CdkBridge.context(stack);

new StepFunctions(stack, 'StateMachine', {
  context,
  roleDescription: 'Execution role for acme-dev-app state machine',
  definition: {
    Comment: 'Minimal state machine',
    StartAt: 'Pass',
    States: {
      Pass: {
        Type: 'Pass',
        End: true,
      },
    },
  },
});

app.synth();
