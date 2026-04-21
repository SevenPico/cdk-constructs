import { makeContext } from '@sevenpico/cdk-context';
import { App, Stack } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { LambdaFunction } from '../src/lambda-function';

// Shared context matching examples/*/cdk.json
const CONTEXT = makeContext({ namespace: 'acme', environment: 'dev', stage: 'app' });

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
    new LambdaFunction(stack, 'Fn', {
      context: CONTEXT,
      runtime: 'nodejs20.x',
      handler: 'index.handler',
      s3Bucket: 'acme-dev-app-lambda-artifacts',
      s3Key: 'functions/my-function.zip',
    });
    template = Template.fromStack(stack);
  });

  test('creates exactly 1 Lambda function', () => {
    template.resourceCountIs('AWS::Lambda::Function', 1);
  });

  test('function name is derived from context', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      FunctionName: 'acme-dev-app',
    });
  });

  test('runtime is nodejs20.x', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      Runtime: 'nodejs20.x',
    });
  });

  test('handler is index.handler', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      Handler: 'index.handler',
    });
  });

  test('memory size defaults to 128 MB', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      MemorySize: 128,
    });
  });

  test('timeout defaults to 3 seconds', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      Timeout: 3,
    });
  });

  test('creates exactly 1 CloudWatch log group', () => {
    template.resourceCountIs('AWS::Logs::LogGroup', 1);
  });

  test('log group name matches function name', () => {
    template.hasResourceProperties('AWS::Logs::LogGroup', {
      LogGroupName: '/aws/lambda/acme-dev-app',
    });
  });

  test('creates an IAM execution role', () => {
    template.resourceCountIs('AWS::IAM::Role', 1);
  });

  test('execution role has AWSLambdaBasicExecutionRole', () => {
    template.hasResourceProperties('AWS::IAM::Role', {
      ManagedPolicyArns: Match.arrayWith([
        Match.objectLike({
          'Fn::Join': Match.arrayWith([
            Match.arrayWith([Match.stringLikeRegexp('AWSLambdaBasicExecutionRole')]),
          ]),
        }),
      ]),
    });
  });
});

// ---------------------------------------------------------------------------
// Example scenario: comprehensive
// ---------------------------------------------------------------------------

describe('Example: comprehensive', () => {
  let template: Template;

  beforeAll(() => {
    const stack = makeStack();
    new LambdaFunction(stack, 'Fn', {
      context: CONTEXT,
      runtime: 'nodejs20.x',
      handler: 'index.handler',
      s3Bucket: 'acme-dev-app-lambda-artifacts',
      s3Key: 'functions/my-function.zip',
      description: 'Acme data processing function',
      memorySizeMb: 512,
      timeoutSeconds: 30,
      architecture: 'arm64',
      tracingMode: 'Active',
      lambdaInsightsEnabled: true,
      cloudwatchLogsRetentionDays: 30,
      reservedConcurrentExecutions: 10,
      environment: {
        variables: {
          LOG_LEVEL: 'INFO',
          STAGE: 'dev',
        },
      },
      ssmParameterNames: ['/acme/dev/app/db-url'],
    });
    template = Template.fromStack(stack);
  });

  test('creates exactly 1 Lambda function', () => {
    template.resourceCountIs('AWS::Lambda::Function', 1);
  });

  test('memory size is 512 MB', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      MemorySize: 512,
    });
  });

  test('timeout is 30 seconds', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      Timeout: 30,
    });
  });

  test('architecture is arm64', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      Architectures: ['arm64'],
    });
  });

  test('X-Ray tracing is Active', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      TracingConfig: { Mode: 'Active' },
    });
  });

  test('reserved concurrent executions is 10', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      ReservedConcurrentExecutions: 10,
    });
  });

  test('environment variables are set', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      Environment: {
        Variables: Match.objectLike({
          LOG_LEVEL: 'INFO',
          STAGE: 'dev',
        }),
      },
    });
  });

  test('description is set', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      Description: 'Acme data processing function',
    });
  });

  test('log group has 30-day retention', () => {
    template.hasResourceProperties('AWS::Logs::LogGroup', {
      RetentionInDays: 30,
    });
  });

  test('execution role has XRay policy', () => {
    template.hasResourceProperties('AWS::IAM::Role', {
      ManagedPolicyArns: Match.arrayWith([
        Match.objectLike({
          'Fn::Join': Match.arrayWith([
            Match.arrayWith([Match.stringLikeRegexp('AWSXRayDaemonWriteAccess')]),
          ]),
        }),
      ]),
    });
  });

  test('execution role has Lambda Insights policy', () => {
    template.hasResourceProperties('AWS::IAM::Role', {
      ManagedPolicyArns: Match.arrayWith([
        Match.objectLike({
          'Fn::Join': Match.arrayWith([
            Match.arrayWith([Match.stringLikeRegexp('CloudWatchLambdaInsightsExecutionRolePolicy')]),
          ]),
        }),
      ]),
    });
  });

  test('execution role has SSM read policy', () => {
    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: Match.objectLike({
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: Match.arrayWith(['ssm:GetParameter', 'ssm:GetParameters', 'ssm:GetParametersByPath']),
          }),
        ]),
      }),
    });
  });
});

// ---------------------------------------------------------------------------
// Example scenario: role-source-policy-documents
// ---------------------------------------------------------------------------

describe('Example: role-source-policy-documents', () => {
  let template: Template;

  beforeAll(() => {
    const stack = makeStack();
    new LambdaFunction(stack, 'Fn', {
      context: CONTEXT,
      s3Bucket: 'my-bucket',
      s3Key: 'code.zip',
      roleSourcePolicyDocuments: [
        JSON.stringify({
          Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }],
        }),
        // policy doc with no Statement — exercises the `?? []` fallback
        JSON.stringify({ Version: '2012-10-17' }),
      ],
    });
    template = Template.fromStack(stack);
  });

  test('creates IAM policy from source policy documents', () => {
    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: Match.objectLike({
        Statement: Match.arrayWith([
          Match.objectLike({ Action: 's3:GetObject', Effect: 'Allow' }),
        ]),
      }),
    });
  });
});

// ---------------------------------------------------------------------------
// Example scenario: branch edge cases
// ---------------------------------------------------------------------------

describe('Example: branch edge cases', () => {
  test('reservedConcurrentExecutions -1 results in no reservation', () => {
    const stack = makeStack();
    new LambdaFunction(stack, 'Fn', {
      context: CONTEXT,
      s3Bucket: 'my-bucket',
      s3Key: 'code.zip',
      reservedConcurrentExecutions: -1,
    });
    const template = Template.fromStack(stack);
    const resources = template.toJSON().Resources;
    const fn = Object.values(resources).find((r: any) => r.Type === 'AWS::Lambda::Function') as any;
    expect(fn.Properties.ReservedConcurrentExecutions).toBeUndefined();
  });

  test('cloudwatchLogsKmsKeyArn encrypts the log group', () => {
    const stack = makeStack();
    new LambdaFunction(stack, 'Fn', {
      context: CONTEXT,
      s3Bucket: 'my-bucket',
      s3Key: 'code.zip',
      cloudwatchLogsKmsKeyArn: 'arn:aws:kms:us-east-1:123456789012:key/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    });
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::Logs::LogGroup', {
      KmsKeyId: Match.anyValue(),
    });
  });

  test('layers are attached to the function', () => {
    const stack = makeStack();
    new LambdaFunction(stack, 'Fn', {
      context: CONTEXT,
      s3Bucket: 'my-bucket',
      s3Key: 'code.zip',
      layers: ['arn:aws:lambda:us-east-1:123456789012:layer:my-layer:1'],
    });
    const template = Template.fromStack(stack);
    const resources = template.toJSON().Resources;
    const fn = Object.values(resources).find((r: any) => r.Type === 'AWS::Lambda::Function') as any;
    expect(fn.Properties.Layers).toBeDefined();
    expect(fn.Properties.Layers.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Example scenario: efs-filesystem
// ---------------------------------------------------------------------------

describe('Example: efs-filesystem', () => {
  let template: Template;

  beforeAll(() => {
    const stack = makeStack();
    new LambdaFunction(stack, 'Fn', {
      context: CONTEXT,
      s3Bucket: 'my-bucket',
      s3Key: 'code.zip',
      fileSystemConfig: {
        arn: 'arn:aws:elasticfilesystem:us-east-1:123456789012:access-point/fsap-abcdef123456',
        localMountPath: '/mnt/data',
      },
    });
    template = Template.fromStack(stack);
  });

  test('lambda function has EFS file system config via escape hatch', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      FileSystemConfigs: Match.arrayWith([
        Match.objectLike({ LocalMountPath: '/mnt/data' }),
      ]),
    });
  });
});

// ---------------------------------------------------------------------------
// Example scenario: disabled
// ---------------------------------------------------------------------------

describe('Example: disabled', () => {
  let template: Template;

  beforeAll(() => {
    const stack = makeStack();
    new LambdaFunction(stack, 'Fn', {
      context: makeContext({ namespace: 'acme', environment: 'dev', stage: 'app', enabled: false }),
      runtime: 'nodejs20.x',
      handler: 'index.handler',
      s3Bucket: 'acme-dev-app-lambda-artifacts',
      s3Key: 'functions/my-function.zip',
    });
    template = Template.fromStack(stack);
  });

  test('creates no Lambda functions when disabled', () => {
    template.resourceCountIs('AWS::Lambda::Function', 0);
  });

  test('creates no log groups when disabled', () => {
    template.resourceCountIs('AWS::Logs::LogGroup', 0);
  });

  test('creates no IAM roles when disabled', () => {
    template.resourceCountIs('AWS::IAM::Role', 0);
  });
});
