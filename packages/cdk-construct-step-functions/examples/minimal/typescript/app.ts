import { App, Stack } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { StepFunctions } from '@sevenpico/cdk-construct-step-functions';

const app = new App();
const stack = new Stack(app, 'StepFunctionsMinimalStack');

const context = makeContext({
  namespace: 'acme',
  environment: 'dev',
  stage: 'app',
});

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
