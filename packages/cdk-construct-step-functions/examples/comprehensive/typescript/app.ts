import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { StepFunctions } from '@sevenpico/cdk-construct-step-functions';

const app = new App();
const stack = new Stack(app, 'StepFunctionsComprehensiveStack');

const context = CdkBridge.context(stack);

new StepFunctions(stack, 'StateMachine', {
  context,
  roleDescription: 'Execution role for acme-dev-app workflow',
  type: 'EXPRESS',
  tracingEnabled: true,
  logGroupRetentionDays: 30,
  loggingConfiguration: {
    level: 'ALL',
    includeExecutionData: true,
  },
  managedPolicyArns: ['arn:aws:iam::aws:policy/AWSLambda_ReadOnlyAccess'],
  definition: {
    Comment: 'Comprehensive state machine with Lambda invoke',
    StartAt: 'ProcessInput',
    States: {
      ProcessInput: {
        Type: 'Task',
        Resource: 'arn:aws:states:::lambda:invoke',
        Parameters: {
          FunctionName: 'arn:aws:lambda:us-east-1:123456789012:function:acme-dev-app-processor',
          'Payload.$': '$',
        },
        Next: 'Success',
      },
      Success: {
        Type: 'Succeed',
      },
    },
  },
});

app.synth();
