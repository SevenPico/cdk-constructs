import { makeContext } from '@sevenpico/cdk-context';
import { App, Stack } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { loadFeature, defineFeature } from 'jest-cucumber';
import { LambdaFunction } from '../src/lambda-function';
import { LambdaFunctionProps } from '../src/lambda-function-types';

const feature = loadFeature(require.resolve('./lambda-function.feature'));

defineFeature(feature, (test: any) => {
  let app: App;
  let stack: Stack;
  let template: Template;
  let props: LambdaFunctionProps;

  const baseCode = { s3Bucket: 'my-bucket', s3Key: 'code.zip' };

  beforeEach(() => {
    app = new App();
    stack = new Stack(app, 'Test');
  });

  test('Function uses context ID as name by default', ({ given, when, then }: any) => {
    given(/^a context with namespace "(.*)", stage "(.*)", name "(.*)"$/, (ns: string, stage: string, name: string) => {
      props = {
        context: makeContext({ namespace: ns, stage, name }),
        ...baseCode,
      };
    });

    when('a LambdaFunction is created without explicit functionName', () => {
      new LambdaFunction(stack, 'SUT', props);
      template = Template.fromStack(stack);
    });

    then(/^the Lambda function name is "(.*)"$/, (expected: string) => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        FunctionName: expected,
      });
    });
  });

  test('Custom function name overrides context ID', ({ given, and, when, then }: any) => {
    let customName: string;

    given(/^a context with namespace "(.*)", stage "(.*)", name "(.*)"$/, (ns: string, stage: string, name: string) => {
      props = {
        context: makeContext({ namespace: ns, stage, name }),
        ...baseCode,
      };
    });

    and(/^functionName is set to "(.*)"$/, (name: string) => {
      customName = name;
      props = { ...props, functionName: customName };
    });

    when('a LambdaFunction is created', () => {
      new LambdaFunction(stack, 'SUT', props);
      template = Template.fromStack(stack);
    });

    then(/^the Lambda function name is "(.*)"$/, (expected: string) => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        FunctionName: expected,
      });
    });
  });

  test('CloudWatch log group is always created', ({ given, when, then }: any) => {
    given('a valid context and function code', () => {
      props = {
        context: makeContext({ namespace: '7p', stage: 'prod', name: 'processor' }),
        ...baseCode,
      };
    });

    when('a LambdaFunction is created', () => {
      new LambdaFunction(stack, 'SUT', props);
      template = Template.fromStack(stack);
    });

    then('a CloudWatch log group exists', () => {
      template.resourceCountIs('AWS::Logs::LogGroup', 1);
      template.hasResourceProperties('AWS::Logs::LogGroup', {
        LogGroupName: '/aws/lambda/7p-prod-processor',
      });
    });
  });

  test('IAM execution role is created with Lambda trust', ({ given, when, then }: any) => {
    given('a valid context and function code', () => {
      props = {
        context: makeContext({ namespace: '7p', stage: 'prod', name: 'processor' }),
        ...baseCode,
      };
    });

    when('a LambdaFunction is created', () => {
      new LambdaFunction(stack, 'SUT', props);
      template = Template.fromStack(stack);
    });

    then(/^an IAM role exists with trust policy allowing "(.*)"$/, (service: string) => {
      template.hasResourceProperties('AWS::IAM::Role', {
        AssumeRolePolicyDocument: Match.objectLike({
          Statement: Match.arrayWith([
            Match.objectLike({
              Principal: Match.objectLike({
                Service: service,
              }),
            }),
          ]),
        }),
      });
    });
  });

  test('VPC access policy added when VPC config provided', ({ given, when, then }: any) => {
    given('a context and a vpcConfig with security group and subnet IDs', () => {
      props = {
        context: makeContext({ namespace: '7p', stage: 'prod', name: 'processor' }),
        ...baseCode,
        vpcConfig: {
          securityGroupIds: ['sg-12345678'],
          subnetIds: ['subnet-12345678'],
        },
      };
    });

    when('a LambdaFunction is created', () => {
      new LambdaFunction(stack, 'SUT', props);
      template = Template.fromStack(stack);
    });

    then(/^the execution role has the "(.*)" managed policy$/, (policyName: string) => {
      const json = template.toJSON();
      const roles = Object.values(json.Resources).filter(
        (r: any) => r.Type === 'AWS::IAM::Role',
      );
      const role = roles.find((r: any) =>
        JSON.stringify(r).includes(policyName),
      );
      expect(role).toBeDefined();
    });
  });

  test('X-Ray write policy added when tracingMode is Active', ({ given, when, then }: any) => {
    given(/^a context and tracingMode set to "(.*)"$/, (mode: string) => {
      props = {
        context: makeContext({ namespace: '7p', stage: 'prod', name: 'processor' }),
        ...baseCode,
        tracingMode: mode,
      };
    });

    when('a LambdaFunction is created', () => {
      new LambdaFunction(stack, 'SUT', props);
      template = Template.fromStack(stack);
    });

    then(/^the execution role has the "(.*)" managed policy$/, (policyName: string) => {
      const json = template.toJSON();
      const roles = Object.values(json.Resources).filter(
        (r: any) => r.Type === 'AWS::IAM::Role',
      );
      const role = roles.find((r: any) =>
        JSON.stringify(r).includes(policyName),
      );
      expect(role).toBeDefined();
    });
  });

  test('No resources created when context is disabled', ({ given, when, then, and }: any) => {
    given('a context with enabled set to false', () => {
      props = {
        context: makeContext({ namespace: '7p', stage: 'prod', name: 'processor', enabled: false }),
        ...baseCode,
      };
    });

    when('a LambdaFunction is created', () => {
      new LambdaFunction(stack, 'SUT', props);
      template = Template.fromStack(stack);
    });

    then('no AWS Lambda Function resources exist in the stack', () => {
      template.resourceCountIs('AWS::Lambda::Function', 0);
    });

    and('no AWS IAM Role resources exist in the stack', () => {
      template.resourceCountIs('AWS::IAM::Role', 0);
    });
  });
});


// Additional prop tests beyond BDD scenarios
describe('LambdaFunction additional props', () => {
  const baseCode = { s3Bucket: 'my-bucket', s3Key: 'code.zip' };

  test('kmsKeyArn sets environment encryption key', () => {
    const app = new App();
    const stack = new Stack(app, 'Test');
    new LambdaFunction(stack, 'SUT', {
      context: makeContext({ namespace: '7p', stage: 'prod', name: 'processor' }),
      ...baseCode,
      kmsKeyArn: 'arn:aws:kms:us-east-1:123456789012:key/test-key-id',
    });
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::Lambda::Function', {
      KmsKeyArn: 'arn:aws:kms:us-east-1:123456789012:key/test-key-id',
    });
  });

  test('publish creates a Lambda version', () => {
    const app = new App();
    const stack = new Stack(app, 'Test');
    new LambdaFunction(stack, 'SUT', {
      context: makeContext({ namespace: '7p', stage: 'prod', name: 'processor' }),
      ...baseCode,
      publish: true,
    });
    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::Lambda::Version', 1);
  });

  test('publish false does not create a Lambda version', () => {
    const app = new App();
    const stack = new Stack(app, 'Test');
    new LambdaFunction(stack, 'SUT', {
      context: makeContext({ namespace: '7p', stage: 'prod', name: 'processor' }),
      ...baseCode,
      publish: false,
    });
    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::Lambda::Version', 0);
  });

  test('roleName uses existing role instead of creating one', () => {
    const app = new App();
    const stack = new Stack(app, 'Test');
    const construct = new LambdaFunction(stack, 'SUT', {
      context: makeContext({ namespace: '7p', stage: 'prod', name: 'processor' }),
      ...baseCode,
      roleName: 'my-existing-role',
    });
    expect(construct.role).toBeUndefined();
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::Lambda::Function', {
      Role: Match.objectLike({
        'Fn::Join': Match.arrayWith([
          Match.arrayWith([
            Match.stringLikeRegexp('my-existing-role'),
          ]),
        ]),
      }),
    });
  });

  test('without roleName creates a new role', () => {
    const app = new App();
    const stack = new Stack(app, 'Test');
    const construct = new LambdaFunction(stack, 'SUT', {
      context: makeContext({ namespace: '7p', stage: 'prod', name: 'processor' }),
      ...baseCode,
    });
    expect(construct.role).toBeDefined();
  });
});
