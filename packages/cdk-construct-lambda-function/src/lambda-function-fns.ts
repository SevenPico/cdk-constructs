import { execSync } from 'child_process';
import * as path from 'path';
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
export const resolveCodeSource = (props: LambdaFunctionProps): 'ecr' | 's3' | 'asset' | 'bundle' => {
  if (props.imageUri) return 'ecr';
  if (props.s3Bucket && props.s3Key) return 's3';
  if (props.entryPoint) return 'bundle';
  if (props.filename) return 'asset';
  throw new Error('LambdaFunction: one of entryPoint, filename, s3Bucket/s3Key, or imageUri must be provided');
};

/** Bundle a TypeScript/JavaScript entry point with esbuild at synth time. */
export const bundleEntryPoint = (props: LambdaFunctionProps): lambda.Code => {
  const entry = path.resolve(props.entryPoint!);
  const external = (props.bundlingExternalModules ?? ['@aws-sdk/*'])
    .map(m => `--external:${m}`)
    .join(' ');
  const target = props.bundlingNodeTarget ?? 'node20';

  return lambda.Code.fromAsset(path.dirname(entry), {
    bundling: {
      image: lambdaRuntime(props.runtime).bundlingImage,
      local: {
        tryBundle(outputDir: string): boolean {
          try {
            execSync(
              `npx esbuild ${entry} --bundle --platform=node --target=${target} ${external} --outfile=${outputDir}/index.js`,
              { stdio: 'inherit' },
            );
            return true;
          } catch {
            return false;
          }
        },
      },
      command: [
        'bash', '-c',
        `npx esbuild /asset-input/${path.basename(entry)} --bundle --platform=node --target=${target} ${external} --outfile=/asset-output/index.js`,
      ],
    },
  });
};

