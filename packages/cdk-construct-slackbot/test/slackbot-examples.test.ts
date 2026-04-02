import * as path from 'path';
import { App, Stack } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { makeContext } from '@sevenpico/cdk-context';
import { Slackbot } from '../src/slackbot';

// Fixture values matching examples/*/cdk.json
const CONTEXT = makeContext({ namespace: 'acme', environment: 'dev', stage: 'app' });
const SLACK_TOKEN_ARN = 'arn:aws:secretsmanager:us-east-1:123456789012:secret:acme/dev/app/slack-token-AbCdEf';
const SECRETS_KMS_KEY_ARN = 'arn:aws:kms:us-east-1:123456789012:key/cccccccc-dddd-eeee-ffff-000000000000';
const LAMBDA_CODE_PATH = path.join(__dirname, 'fixtures', 'lambda');

const MINIMAL_PROPS = {
  context: CONTEXT,
  slackChannels: { alerts: 'C01234ABCDE' },
  slackTokenSecretArn: SLACK_TOKEN_ARN,
  lambdaCodePath: LAMBDA_CODE_PATH,
};

function makeStack(): Stack {
  const app = new App();
  return new Stack(app, 'TestStack');
}

// ---------------------------------------------------------------------------
// Example scenario: minimal
// ---------------------------------------------------------------------------

describe('Example: minimal', () => {
  let template: Template;

  beforeAll(() => {
    const stack = makeStack();
    new Slackbot(stack, 'SlackbotConstruct', MINIMAL_PROPS);
    template = Template.fromStack(stack);
  });

  test('creates one SNS topic', () => {
    template.resourceCountIs('AWS::SNS::Topic', 1);
  });

  test('SNS topic name is derived from context', () => {
    template.hasResourceProperties('AWS::SNS::Topic', {
      TopicName: 'acme-dev-app-notifications',
    });
  });

  test('creates one Lambda function', () => {
    template.resourceCountIs('AWS::Lambda::Function', 1);
  });

  test('Lambda function name is derived from context', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      FunctionName: 'acme-dev-app-handler',
    });
  });

  test('Lambda handler and runtime are set correctly', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      Handler: 'main.lambda_handler',
      Runtime: 'python3.9',
    });
  });

  test('Lambda environment includes SLACK_CHANNELS and SLACK_TOKEN_SECRET_ARN', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      Environment: {
        Variables: {
          SLACK_CHANNELS: JSON.stringify({ alerts: 'C01234ABCDE' }),
          SLACK_TOKEN_SECRET_ARN: SLACK_TOKEN_ARN,
        },
      },
    });
  });

  test('IAM role name is derived from context', () => {
    template.hasResourceProperties('AWS::IAM::Role', {
      RoleName: 'acme-dev-app-handler-role',
    });
  });

  test('Lambda role has GetSecretValue permission', () => {
    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: Match.objectLike({
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: 'secretsmanager:GetSecretValue',
            Resource: SLACK_TOKEN_ARN,
          }),
        ]),
      }),
    });
  });

  test('CloudWatch log group name is derived from context', () => {
    template.hasResourceProperties('AWS::Logs::LogGroup', {
      LogGroupName: '/aws/lambda/acme-dev-app-handler',
    });
  });

  test('SNS subscription links topic to Lambda', () => {
    template.hasResourceProperties('AWS::SNS::Subscription', {
      Protocol: 'lambda',
    });
  });

  test('context tags applied to SNS topic', () => {
    const ctx = makeContext({
      namespace: 'acme', environment: 'dev', stage: 'app',
      tags: { Owner: 'platform-team' },
    });
    const stack = makeStack();
    new Slackbot(stack, 'SlackbotConstruct', { ...MINIMAL_PROPS, context: ctx });
    const t = Template.fromStack(stack);
    t.hasResourceProperties('AWS::SNS::Topic', {
      Tags: Match.arrayWith([
        Match.objectLike({ Key: 'Owner', Value: 'platform-team' }),
      ]),
    });
  });
});

// ---------------------------------------------------------------------------
// Example scenario: with-kms
// ---------------------------------------------------------------------------

describe('Example: with-kms', () => {
  let template: Template;

  beforeAll(() => {
    const stack = makeStack();
    new Slackbot(stack, 'SlackbotConstruct', {
      ...MINIMAL_PROPS,
      slackTokenSecretKmsKeyArn: SECRETS_KMS_KEY_ARN,
    });
    template = Template.fromStack(stack);
  });

  test('Lambda role has KMS decrypt permission', () => {
    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: Match.objectLike({
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: ['kms:Decrypt', 'kms:DescribeKey'],
            Resource: SECRETS_KMS_KEY_ARN,
          }),
        ]),
      }),
    });
  });

  test('Lambda role still has GetSecretValue permission', () => {
    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: Match.objectLike({
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: 'secretsmanager:GetSecretValue',
            Resource: SLACK_TOKEN_ARN,
          }),
        ]),
      }),
    });
  });

  test('SNS topic and Lambda still created', () => {
    template.resourceCountIs('AWS::SNS::Topic', 1);
    template.resourceCountIs('AWS::Lambda::Function', 1);
  });
});

// ---------------------------------------------------------------------------
// Example scenario: comprehensive
// ---------------------------------------------------------------------------

describe('Example: comprehensive', () => {
  let template: Template;

  beforeAll(() => {
    const stack = makeStack();
    new Slackbot(stack, 'SlackbotConstruct', {
      ...MINIMAL_PROPS,
      slackChannels: {
        alerts: 'C01234ABCDE',
        deployments: 'C09876ZYXWV',
        incidents: 'C0INCIDENT0',
      },
      slackTokenSecretKmsKeyArn: SECRETS_KMS_KEY_ARN,
      lambdaRuntime: 'python3.11',
      cloudwatchLogExpirationDays: 30,
      snsPubPrincipals: {
        Service: ['cloudwatch.amazonaws.com', 'events.amazonaws.com'],
      },
      snsSubPrincipals: {
        AWS: ['arn:aws:iam::123456789012:role/acme-dev-app-ops-role'],
      },
    });
    template = Template.fromStack(stack);
  });

  test('Lambda environment includes all three Slack channels', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      Environment: {
        Variables: {
          SLACK_CHANNELS: JSON.stringify({
            alerts: 'C01234ABCDE',
            deployments: 'C09876ZYXWV',
            incidents: 'C0INCIDENT0',
          }),
        },
      },
    });
  });

  test('Lambda uses custom runtime', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      Runtime: 'python3.11',
    });
  });

  test('CloudWatch log group uses custom retention', () => {
    template.hasResourceProperties('AWS::Logs::LogGroup', {
      RetentionInDays: 30,
    });
  });
});

// ---------------------------------------------------------------------------
// Example scenario: disabled
// ---------------------------------------------------------------------------

describe('Example: disabled', () => {
  test('no resources created when context is disabled', () => {
    const stack = makeStack();
    new Slackbot(stack, 'SlackbotConstruct', {
      ...MINIMAL_PROPS,
      context: makeContext({ namespace: 'acme', environment: 'dev', stage: 'app', enabled: false }),
    });
    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::SNS::Topic', 0);
    template.resourceCountIs('AWS::Lambda::Function', 0);
  });

  test('disabled construct exposes no SNS topic', () => {
    const stack = makeStack();
    const construct = new Slackbot(stack, 'SlackbotConstruct', {
      ...MINIMAL_PROPS,
      context: makeContext({ namespace: 'acme', environment: 'dev', stage: 'app', enabled: false }),
    });
    expect(construct.snsTopic).toBeUndefined();
  });

  test('disabled construct exposes no Lambda function', () => {
    const stack = makeStack();
    const construct = new Slackbot(stack, 'SlackbotConstruct', {
      ...MINIMAL_PROPS,
      context: makeContext({ namespace: 'acme', environment: 'dev', stage: 'app', enabled: false }),
    });
    expect(construct.lambdaFn).toBeUndefined();
  });
});
