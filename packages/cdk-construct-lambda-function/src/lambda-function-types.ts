import { Context } from '@sevenpico/cdk-context';

export interface LambdaVpcConfig {
  readonly securityGroupIds: string[];
  readonly subnetIds: string[];
}

export interface LambdaFileSystemConfig {
  readonly arn: string;
  readonly localMountPath: string;
}

export interface LambdaEnvironment {
  readonly variables: Record<string, string>;
}

export interface LambdaFunctionProps {
  readonly context: Context;

  /** Function name. Default: context.id */
  readonly functionName?: string;

  /** Handler entrypoint (e.g. 'index.handler'). Required for Zip packages. */
  readonly handler?: string;

  /** Runtime (e.g. 'nodejs20.x'). Required for Zip packages. */
  readonly runtime?: string;

  /** Local path to deployment ZIP file */
  readonly filename?: string;

  /** S3 bucket containing deployment package */
  readonly s3Bucket?: string;

  /** S3 key of deployment package */
  readonly s3Key?: string;

  /** S3 object version */
  readonly s3ObjectVersion?: string;

  /** ECR image URI. Use when packageType = 'Image'. */
  readonly imageUri?: string;

  /** Deployment package type. 'Zip' | 'Image'. Default: 'Zip' */
  readonly packageType?: string;

  /** Function description */
  readonly description?: string;

  /** Memory in MB. Default: 128 */
  readonly memorySizeMb?: number;

  /** Timeout in seconds. Default: 3 */
  readonly timeoutSeconds?: number;

  /** Reserved concurrent executions. -1 = no limit. Default: -1 */
  readonly reservedConcurrentExecutions?: number;

  /** Instruction set architecture. 'x86_64' | 'arm64'. Default: 'x86_64' */
  readonly architecture?: string;

  /** Environment variables */
  readonly environment?: LambdaEnvironment;

  /** KMS key ARN for environment variable encryption */
  readonly kmsKeyArn?: string;

  /** Lambda layer ARNs (max 5) */
  readonly layers?: string[];

  /** Publish new version on each deploy. Default: false */
  readonly publish?: boolean;

  /** X-Ray tracing mode. 'Active' | 'PassThrough'. Default: no tracing */
  readonly tracingMode?: string;

  /** Enable CloudWatch Lambda Insights. Default: false */
  readonly lambdaInsightsEnabled?: boolean;

  /** CloudWatch log retention in days. Default: no expiry */
  readonly cloudwatchLogsRetentionDays?: number;

  /** KMS key ARN for CloudWatch log encryption */
  readonly cloudwatchLogsKmsKeyArn?: string;

  /** VPC configuration */
  readonly vpcConfig?: LambdaVpcConfig;

  /** EFS file system configuration */
  readonly fileSystemConfig?: LambdaFileSystemConfig;

  /** SSM parameter name prefixes this function should be able to read */
  readonly ssmParameterNames?: string[];

  /** Additional IAM policy document JSON strings for the execution role */
  readonly roleSourcePolicyDocuments?: string[];

  /** Existing IAM role name to use instead of creating one */
  readonly roleName?: string;

  /**
   * Path to the TypeScript or JavaScript entry file to bundle with esbuild.
   * When provided, the construct bundles the source at synth time — no pre-build step needed.
   * Mutually exclusive with filename, s3Bucket/s3Key, and imageUri.
   */
  readonly entryPoint?: string;

  /** Modules to exclude from the bundle (available in the Lambda runtime). Default: ['@aws-sdk/*'] */
  readonly bundlingExternalModules?: string[];

  /** Node.js target for esbuild. Default: 'node20' */
  readonly bundlingNodeTarget?: string;

  /**
   * Root directory to use for CDK asset fingerprinting.
   * Defaults to the directory containing entryPoint.
   * Override when shared source files live in a parent directory — CDK hashes
   * this entire directory, so changes to shared files trigger a redeployment.
   */
  readonly bundlingAssetDir?: string;
}
