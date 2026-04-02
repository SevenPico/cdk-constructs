import { App, Stack } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { makeContext } from '@sevenpico/cdk-context';
import { StepFunctions } from '../src/step-functions';
import { StepFunctionsProps } from '../src/step-functions-types';

const context = makeContext({ namespace: '7p', stage: 'prod', name: 'workflow' });
const definition = { StartAt: 'Pass', States: { Pass: { Type: 'Pass', End: true } } };

const baseProps: StepFunctionsProps = {
  context,
  definition,
  roleDescription: 'Step Functions execution role',
};

const synthTemplate = (props: StepFunctionsProps): Template => {
  const app = new App();
  const stack = new Stack(app, 'TestStack');
  new StepFunctions(stack, 'SUT', props);
  return Template.fromStack(stack);
};

describe('StepFunctions construct', () => {
  describe('State Machine Naming', () => {
    test('state machine uses context ID as name', () => {
      const template = synthTemplate(baseProps);
      template.hasResourceProperties('AWS::StepFunctions::StateMachine', {
        StateMachineName: '7p-prod-workflow',
      });
    });

    test('custom state machine name overrides context ID', () => {
      const template = synthTemplate({ ...baseProps, stateMachineName: 'my-workflow' });
      template.hasResourceProperties('AWS::StepFunctions::StateMachine', {
        StateMachineName: 'my-workflow',
      });
    });
  });

  describe('State Machine Type', () => {
    test('standard state machine created by default', () => {
      const template = synthTemplate(baseProps);
      template.hasResourceProperties('AWS::StepFunctions::StateMachine', {
        StateMachineType: 'STANDARD',
      });
    });

    test('express state machine created when type is EXPRESS', () => {
      const template = synthTemplate({ ...baseProps, type: 'EXPRESS' });
      template.hasResourceProperties('AWS::StepFunctions::StateMachine', {
        StateMachineType: 'EXPRESS',
      });
    });
  });

  describe('Logging', () => {
    test('CloudWatch log group created by default', () => {
      const template = synthTemplate(baseProps);
      template.hasResourceProperties('AWS::Logs::LogGroup', {
        LogGroupName: '/aws/states/7p-prod-workflow',
      });
    });

    test('existing log group used when ARN provided', () => {
      const template = synthTemplate({
        ...baseProps,
        existingLogGroupArn: 'arn:aws:logs:us-east-1:123456789012:log-group:/existing/logs',
      });
      // CDK appends :* to log group ARNs from fromLogGroupArn
      template.hasResourceProperties('AWS::StepFunctions::StateMachine', {
        LoggingConfiguration: Match.objectLike({
          Destinations: Match.arrayWith([
            Match.objectLike({
              CloudWatchLogsLogGroup: {
                LogGroupArn: 'arn:aws:logs:us-east-1:123456789012:log-group:/existing/logs:*',
              },
            }),
          ]),
        }),
      });
    });
  });

  describe('IAM Role', () => {
    test('creates execution role with context ID name', () => {
      const template = synthTemplate(baseProps);
      template.hasResourceProperties('AWS::IAM::Role', {
        RoleName: '7p-prod-workflow',
        Description: 'Step Functions execution role',
      });
    });

    test('role has an assume role policy document', () => {
      const template = synthTemplate(baseProps);
      template.hasResourceProperties('AWS::IAM::Role', {
        AssumeRolePolicyDocument: Match.objectLike({
          Statement: Match.arrayWith([
            Match.objectLike({
              Action: 'sts:AssumeRole',
              Effect: 'Allow',
            }),
          ]),
        }),
      });
    });

    test('attaches managed policies when provided', () => {
      const template = synthTemplate({
        ...baseProps,
        managedPolicyArns: ['arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess'],
      });
      template.hasResourceProperties('AWS::IAM::Role', {
        ManagedPolicyArns: Match.arrayWith([
          'arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess',
        ]),
      });
    });

    test('attaches inline policy from policy documents', () => {
      const policyDoc = JSON.stringify({
        Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }],
      });
      const template = synthTemplate({ ...baseProps, policyDocuments: [policyDoc] });
      template.hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: Match.objectLike({
          Statement: Match.arrayWith([
            Match.objectLike({
              Effect: 'Allow',
              Action: 's3:GetObject',
              Resource: '*',
            }),
          ]),
        }),
      });
    });
  });

  describe('Tracing', () => {
    test('X-Ray tracing not configured by default', () => {
      const template = synthTemplate(baseProps);
      // CDK omits TracingConfiguration when tracingEnabled is false
      template.hasResourceProperties('AWS::StepFunctions::StateMachine', {
        TracingConfiguration: Match.absent(),
      });
    });

    test('X-Ray tracing enabled when tracingEnabled is true', () => {
      const template = synthTemplate({ ...baseProps, tracingEnabled: true });
      template.hasResourceProperties('AWS::StepFunctions::StateMachine', {
        TracingConfiguration: {
          Enabled: true,
        },
      });
    });
  });

  describe('Tags', () => {
    test('context tags are applied', () => {
      const taggedCtx = makeContext({
        namespace: '7p', stage: 'prod', name: 'workflow',
        tags: { Team: 'platform' },
      });
      const template = synthTemplate({ ...baseProps, context: taggedCtx });
      template.hasResourceProperties('AWS::StepFunctions::StateMachine', {
        Tags: Match.arrayWith([
          { Key: 'Team', Value: 'platform' },
        ]),
      });
    });
  });

  describe('Disabled Construct', () => {
    test('no resources created when context is disabled', () => {
      const disabledCtx = makeContext({
        namespace: '7p', stage: 'prod', name: 'workflow', enabled: false,
      });
      const template = synthTemplate({ ...baseProps, context: disabledCtx });
      expect(
        Object.keys(template.toJSON().Resources ?? {}),
      ).toHaveLength(0);
    });
  });

  describe('Definition', () => {
    test('definition body is serialized to state machine', () => {
      const template = synthTemplate(baseProps);
      template.hasResourceProperties('AWS::StepFunctions::StateMachine', {
        DefinitionString: JSON.stringify(definition),
      });
    });
  });
});
