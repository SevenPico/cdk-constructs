import { Context, contextId } from '@sevenpico/cdk-context';
import { aws_lambda as lambda, aws_logs as logs } from 'aws-cdk-lib';
import { LambdaFunctionProps } from './lambda-function-types';

export const functionName = (ctx: Context, props: LambdaFunctionProps): string =>
  props.functionName ?? contextId(ctx);

export const logGroupName = (ctx: Context, props: LambdaFunctionProps): string =>
  `/aws/lambda/${functionName(ctx, props)}`;

export const lambdaRuntime = (runtime?: string): lambda.Runtime =>
  runtime ? new lambda.Runtime(runtime) : lambda.Runtime.NODEJS_20_X;

export const lambdaArchitecture = (arch?: string): lambda.Architecture =>
  arch === 'arm64' ? lambda.Architecture.ARM_64 : lambda.Architecture.X86_64;

export const lambdaTracingConfig = (mode?: string): lambda.Tracing => {
  if (mode === 'Active') return lambda.Tracing.ACTIVE;
  if (mode === 'PassThrough') return lambda.Tracing.PASS_THROUGH;
  return lambda.Tracing.DISABLED;
};

export const logRetention = (days?: number): logs.RetentionDays | undefined => {
  if (!days) return undefined;
  return days as logs.RetentionDays;
};
