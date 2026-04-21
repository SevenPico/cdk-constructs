import { Context, contextId, extendContext } from '@sevenpico/cdk-context';
import { aws_iam as iam } from 'aws-cdk-lib';
import { SlackbotProps } from './slackbot-types';

export const topicContext = (ctx: Context): Context =>
  extendContext(ctx, { attributes: ['notifications'] });

export const lambdaContext = (ctx: Context): Context =>
  extendContext(ctx, { attributes: ['handler'] });

export const topicName = (ctx: Context): string =>
  contextId(topicContext(ctx));

export const lambdaFunctionName = (ctx: Context): string =>
  contextId(lambdaContext(ctx));

export const lambdaRoleName = (ctx: Context): string =>
  `${contextId(lambdaContext(ctx))}-role`;

export const logGroupName = (ctx: Context): string =>
  `/aws/lambda/${contextId(lambdaContext(ctx))}`;

export const lambdaEnvironment = (props: SlackbotProps): Record<string, string> => ({
  SLACK_CHANNELS: JSON.stringify(props.slackChannels),
  SLACK_TOKEN_SECRET_ARN: props.slackTokenSecretArn,
});

export const secretsManagerPolicyStatements = (
  secretArn: string,
  kmsKeyArn?: string,
): iam.PolicyStatement[] => {
  const statements: iam.PolicyStatement[] = [
    new iam.PolicyStatement({
      actions: ['secretsmanager:GetSecretValue'],
      resources: [secretArn],
    }),
  ];
  if (kmsKeyArn) {
    statements.push(new iam.PolicyStatement({
      actions: ['kms:Decrypt', 'kms:DescribeKey'],
      resources: [kmsKeyArn],
    }));
  }
  return statements;
};
