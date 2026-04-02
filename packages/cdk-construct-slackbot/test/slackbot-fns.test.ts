import { makeContext } from '@sevenpico/cdk-context';
import {
  topicContext,
  lambdaContext,
  topicName,
  lambdaFunctionName,
  lambdaRoleName,
  logGroupName,
  lambdaEnvironment,
  secretsManagerPolicyStatements,
} from '../src/slackbot-fns';
import { SlackbotProps } from '../src/slackbot-types';

const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'slackbot' });

const baseProps: SlackbotProps = {
  context: ctx,
  slackChannels: { alerts: 'C01234' },
  slackTokenSecretArn: 'arn:aws:secretsmanager:us-east-1:123456789012:secret:slack-token',
};

describe('Slackbot pure functions', () => {
  test('topicContext extends with notifications attribute', () => {
    const tCtx = topicContext(ctx);
    expect(tCtx).toBeDefined();
  });

  test('topicName uses topic context', () => {
    expect(topicName(ctx)).toBe('7p-prod-slackbot-notifications');
  });

  test('lambdaContext extends with handler attribute', () => {
    const lCtx = lambdaContext(ctx);
    expect(lCtx).toBeDefined();
  });

  test('lambdaFunctionName uses lambda context', () => {
    expect(lambdaFunctionName(ctx)).toBe('7p-prod-slackbot-handler');
  });

  test('lambdaRoleName appends -role', () => {
    expect(lambdaRoleName(ctx)).toBe('7p-prod-slackbot-handler-role');
  });

  test('logGroupName uses lambda context', () => {
    expect(logGroupName(ctx)).toBe('/aws/lambda/7p-prod-slackbot-handler');
  });

  test('lambdaEnvironment includes SLACK_CHANNELS and SLACK_TOKEN_SECRET_ARN', () => {
    const env = lambdaEnvironment(baseProps);
    expect(env.SLACK_CHANNELS).toBe(JSON.stringify({ alerts: 'C01234' }));
    expect(env.SLACK_TOKEN_SECRET_ARN).toBe(baseProps.slackTokenSecretArn);
  });

  test('secretsManagerPolicyStatements returns GetSecretValue statement', () => {
    const stmts = secretsManagerPolicyStatements(baseProps.slackTokenSecretArn);
    expect(stmts).toHaveLength(1);
    expect(stmts[0].toJSON().Action).toEqual('secretsmanager:GetSecretValue');
  });

  test('secretsManagerPolicyStatements adds KMS statement when kmsKeyArn provided', () => {
    const kmsArn = 'arn:aws:kms:us-east-1:123456789012:key/my-key';
    const stmts = secretsManagerPolicyStatements(baseProps.slackTokenSecretArn, kmsArn);
    expect(stmts).toHaveLength(2);
    expect(stmts[1].toJSON().Action).toEqual(['kms:Decrypt', 'kms:DescribeKey']);
    expect(stmts[1].toJSON().Resource).toEqual(kmsArn);
  });
});
