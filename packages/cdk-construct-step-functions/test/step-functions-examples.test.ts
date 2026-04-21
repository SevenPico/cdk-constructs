import { makeContext } from '@sevenpico/cdk-context';
import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { StepFunctions } from '../src/step-functions';

function makeStack(): Stack {
  const app = new App();
  return new Stack(app, 'TestStack');
}

const CONTEXT = makeContext({ namespace: 'acme', environment: 'dev', stage: 'app' });

const MINIMAL_DEFINITION = {
  Comment: 'Minimal state machine',
  StartAt: 'Pass',
  States: {
    Pass: { Type: 'Pass', End: true },
  },
};

describe('Example: minimal', () => {
  let template: Template;
  beforeAll(() => {
    const stack = makeStack();
    new StepFunctions(stack, 'StateMachine', {
      context: CONTEXT,
      roleDescription: 'Execution role for acme-dev-app state machine',
      definition: MINIMAL_DEFINITION,
    });
    template = Template.fromStack(stack);
  });
  test('creates exactly 1 state machine', () => {
    template.resourceCountIs('AWS::StepFunctions::StateMachine', 1);
  });
  test('creates exactly 1 IAM role', () => {
    template.resourceCountIs('AWS::IAM::Role', 1);
  });
  test('creates exactly 1 log group', () => {
    template.resourceCountIs('AWS::Logs::LogGroup', 1);
  });
});

describe('Example: comprehensive', () => {
  let template: Template;
  beforeAll(() => {
    const stack = makeStack();
    new StepFunctions(stack, 'StateMachine', {
      context: CONTEXT,
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
              'FunctionName': 'arn:aws:lambda:us-east-1:123456789012:function:acme-dev-app-processor',
              'Payload.$': '$',
            },
            Next: 'Success',
          },
          Success: { Type: 'Succeed' },
        },
      },
    });
    template = Template.fromStack(stack);
  });
  test('creates exactly 1 state machine', () => {
    template.resourceCountIs('AWS::StepFunctions::StateMachine', 1);
  });
  test('state machine is EXPRESS type', () => {
    template.hasResourceProperties('AWS::StepFunctions::StateMachine', {
      StateMachineType: 'EXPRESS',
    });
  });
  test('creates exactly 1 IAM role', () => {
    template.resourceCountIs('AWS::IAM::Role', 1);
  });
  test('creates exactly 1 log group', () => {
    template.resourceCountIs('AWS::Logs::LogGroup', 1);
  });
});

describe('Example: disabled', () => {
  let template: Template;
  beforeAll(() => {
    const stack = makeStack();
    new StepFunctions(stack, 'StateMachine', {
      context: makeContext({ namespace: 'acme', environment: 'dev', stage: 'app', enabled: false }),
      roleDescription: 'Execution role for acme-dev-app state machine',
      definition: MINIMAL_DEFINITION,
    });
    template = Template.fromStack(stack);
  });
  test('creates zero state machines when disabled', () => {
    template.resourceCountIs('AWS::StepFunctions::StateMachine', 0);
  });
  test('creates zero IAM roles when disabled', () => {
    template.resourceCountIs('AWS::IAM::Role', 0);
  });
  test('creates zero log groups when disabled', () => {
    template.resourceCountIs('AWS::Logs::LogGroup', 0);
  });
});
