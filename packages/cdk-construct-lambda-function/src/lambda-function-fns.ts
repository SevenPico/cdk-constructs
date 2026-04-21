import { Context, contextId } from '@sevenpico/cdk-context';
import { aws_lambda as lambda, aws_logs as logs, aws_s3 as s3, aws_ecr as ecr } from 'aws-cdk-lib';
import { Construct } from 'constructs';
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

export interface EcrImageParts {
  readonly account: string;
  readonly region: string;
  readonly repoName: string;
  readonly tag?: string;
}

/** Parse an ECR image URI into its component parts. Returns undefined if not a valid ECR URI. */
export const parseEcrImageUri = (uri: string): EcrImageParts | undefined => {
  const match = uri.match(/^(\d+)\.dkr\.ecr\.([\w-]+)\.amazonaws\.com\/([^:]+)(?::(.+))?$/);
  if (!match) return undefined;
  return {
    account: match[1],
    region: match[2],
    repoName: match[3],
    tag: match[4],
  };
};

/** Determine which code source type to use based on props. */
export const resolveCodeSource = (props: LambdaFunctionProps): 'ecr' | 's3' | 'asset' => {
  if (props.imageUri) return 'ecr';
  if (props.s3Bucket && props.s3Key) return 's3';
  if (props.filename) return 'asset';
  throw new Error('LambdaFunction: one of filename, s3Bucket/s3Key, or imageUri must be provided');
};

/** Resolve Lambda code from props. Requires a scope for CDK resource lookups. */
export const resolveCode = (scope: Construct, props: LambdaFunctionProps): lambda.Code => {
  const source = resolveCodeSource(props);
  switch (source) {
    case 'ecr': {
      const parts = parseEcrImageUri(props.imageUri!);
      if (!parts) {
        throw new Error(`LambdaFunction: invalid ECR image URI: ${props.imageUri}`);
      }
      const repo = ecr.Repository.fromRepositoryAttributes(scope, 'EcrRepo', {
        repositoryArn: `arn:aws:ecr:${parts.region}:${parts.account}:repository/${parts.repoName}`,
        repositoryName: parts.repoName,
      });
      return lambda.Code.fromEcrImage(repo, parts.tag ? { tagOrDigest: parts.tag } : undefined);
    }
    case 's3':
      return lambda.Code.fromBucket(
        s3.Bucket.fromBucketName(scope, 'CodeBucket', props.s3Bucket!),
        props.s3Key!,
        props.s3ObjectVersion,
      );
    case 'asset':
      return lambda.Code.fromAsset(props.filename!);
  }
};
