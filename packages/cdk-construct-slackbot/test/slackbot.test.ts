import * as path from 'path';
import { App, Stack } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { makeContext } from '@sevenpico/cdk-context';
import { Slackbot } from '../src/slackbot';
import { SlackbotProps } from '../src/slackbot-types';

const LAMBDA_CODE_PATH = path.join(__dirname, 'fixtures', 'lambda');

const makeStack = (): Stack => {
  const app = new App();
  return new Stack(app, 'TestStack');
};

const baseProps = (overrides?: Partial<SlackbotProps>): SlackbotProps => ({
  context: makeContext({ namespace: '7p', stage: 'prod', name: 'slackbot' }),
  slackChannels: { alerts: 'C01234ABCDE' },
  slackTokenSecretArn: 'arn:aws:secretsmanager:us-east-1:123456789012:secret:slack-token',
  lambdaCodePath: LAMBDA_CODE_PATH,
  ...overrides,
});

describe('Slackbot construct', () => {
  describe('Feature: SNS Topic', () => {
    test('SNS topic created with context-based name', () => {
      const stack = makeStack();
      new Slackbot(stack, 'SUT', baseProps());
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::SNS::Topic', {
        TopicName: '7p-prod-slackbot-notifications',
      });
    });
  });

  describe('Feature: Lambda Function', () => {
    test('Lambda function created with context-based name', () => {
      const stack = makeStack();
      new Slackbot(stack, 'SUT', baseProps());
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::Lambda::Function', {
        FunctionName: '7p-prod-slackbot-handler',
        Handler: 'main.lambda_handler',
        Runtime: 'python3.9',
        Timeout: 30,
      });
    });

    test('Lambda environment includes SLACK_CHANNELS and SLACK_TOKEN_SECRET_ARN', () => {
      const stack = makeStack();
      new Slackbot(stack, 'SUT', baseProps());
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::Lambda::Function', {
        Environment: {
          Variables: {
            SLACK_CHANNELS: JSON.stringify({ alerts: 'C01234ABCDE' }),
            SLACK_TOKEN_SECRET_ARN: 'arn:aws:secretsmanager:us-east-1:123456789012:secret:slack-token',
          },
        },
      });
    });
  });

  describe('Feature: Lambda Subscription', () => {
    test('SNS subscription connects topic to Lambda', () => {
      const stack = makeStack();
      new Slackbot(stack, 'SUT', baseProps());
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::SNS::Subscription', {
        Protocol: 'lambda',
      });
    });
  });

  describe('Feature: Secrets Manager Access', () => {
    test('Lambda role has GetSecretValue permission', () => {
      const stack = makeStack();
      new Slackbot(stack, 'SUT', baseProps());
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: Match.objectLike({
          Statement: Match.arrayWith([
            Match.objectLike({
              Action: 'secretsmanager:GetSecretValue',
              Resource: 'arn:aws:secretsmanager:us-east-1:123456789012:secret:slack-token',
            }),
          ]),
        }),
      });
    });

    test('Lambda role has KMS decrypt permission when kmsKeyArn provided', () => {
      const stack = makeStack();
      const kmsArn = 'arn:aws:kms:us-east-1:123456789012:key/my-key';
      new Slackbot(stack, 'SUT', baseProps({ slackTokenSecretKmsKeyArn: kmsArn }));
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: Match.objectLike({
          Statement: Match.arrayWith([
            Match.objectLike({
              Action: ['kms:Decrypt', 'kms:DescribeKey'],
              Resource: kmsArn,
            }),
          ]),
        }),
      });
    });
  });

  describe('Feature: CloudWatch Logs', () => {
    test('LogGroup created with expected name', () => {
      const stack = makeStack();
      new Slackbot(stack, 'SUT', baseProps());
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::Logs::LogGroup', {
        LogGroupName: '/aws/lambda/7p-prod-slackbot-handler',
      });
    });
  });

  describe('Feature: IAM Role', () => {
    test('Lambda execution role created with expected name', () => {
      const stack = makeStack();
      new Slackbot(stack, 'SUT', baseProps());
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::IAM::Role', {
        RoleName: '7p-prod-slackbot-handler-role',
        AssumeRolePolicyDocument: Match.objectLike({
          Statement: Match.arrayWith([
            Match.objectLike({
              Principal: { Service: 'lambda.amazonaws.com' },
            }),
          ]),
        }),
      });
    });
  });

  describe('Feature: Tagging', () => {
    test('Context tags applied to resources', () => {
      const stack = makeStack();
      new Slackbot(stack, 'SUT', baseProps({
        context: makeContext({ namespace: '7p', stage: 'prod', name: 'slackbot', tags: { Env: 'production' } }),
      }));
      const template = Template.fromStack(stack);
      template.hasResourceProperties('AWS::SNS::Topic', {
        Tags: Match.arrayWith([
          Match.objectLike({ Key: 'Env', Value: 'production' }),
        ]),
      });
    });
  });

  describe('Feature: Disabled Construct', () => {
    test('No resources created when context is disabled', () => {
      const stack = makeStack();
      new Slackbot(stack, 'SUT', baseProps({
        context: makeContext({ namespace: '7p', stage: 'test', name: 'test', enabled: false }),
      }));
      const template = Template.fromStack(stack);
      template.resourceCountIs('AWS::SNS::Topic', 0);
      template.resourceCountIs('AWS::Lambda::Function', 0);
    });
  });
});
