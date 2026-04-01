import { aws_lambda as lambda } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import {
  functionName,
  logGroupName,
  lambdaRuntime,
  lambdaArchitecture,
  lambdaTracingConfig,
  logRetention,
} from '../src/lambda-function-fns';
import { LambdaFunctionProps } from '../src/lambda-function-types';

describe('LambdaFunction pure functions', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'processor' });
  const baseProps: LambdaFunctionProps = {
    context: ctx,
    s3Bucket: 'my-bucket',
    s3Key: 'code.zip',
  };

  describe('functionName', () => {
    test('returns contextId when no functionName provided', () => {
      expect(functionName(ctx, baseProps)).toBe('7p-prod-processor');
    });

    test('returns custom functionName when provided', () => {
      expect(functionName(ctx, { ...baseProps, functionName: 'my-fn' })).toBe('my-fn');
    });
  });

  describe('logGroupName', () => {
    test('returns /aws/lambda/{functionName}', () => {
      expect(logGroupName(ctx, baseProps)).toBe('/aws/lambda/7p-prod-processor');
    });

    test('uses custom functionName in log group path', () => {
      expect(logGroupName(ctx, { ...baseProps, functionName: 'custom' })).toBe(
        '/aws/lambda/custom',
      );
    });
  });

  describe('lambdaRuntime', () => {
    test('returns NODEJS_20_X by default', () => {
      expect(lambdaRuntime()).toBe(lambda.Runtime.NODEJS_20_X);
    });

    test('returns specified runtime', () => {
      const rt = lambdaRuntime('python3.12');
      expect(rt.name).toBe('python3.12');
    });
  });

  describe('lambdaArchitecture', () => {
    test('returns X86_64 by default', () => {
      expect(lambdaArchitecture()).toBe(lambda.Architecture.X86_64);
    });

    test('returns ARM_64 when arm64', () => {
      expect(lambdaArchitecture('arm64')).toBe(lambda.Architecture.ARM_64);
    });
  });

  describe('lambdaTracingConfig', () => {
    test('returns DISABLED when no mode', () => {
      expect(lambdaTracingConfig()).toBe(lambda.Tracing.DISABLED);
    });

    test('returns ACTIVE when Active', () => {
      expect(lambdaTracingConfig('Active')).toBe(lambda.Tracing.ACTIVE);
    });

    test('returns PASS_THROUGH when PassThrough', () => {
      expect(lambdaTracingConfig('PassThrough')).toBe(lambda.Tracing.PASS_THROUGH);
    });
  });

  describe('logRetention', () => {
    test('returns undefined when no days', () => {
      expect(logRetention()).toBeUndefined();
    });

    test('returns days as RetentionDays', () => {
      expect(logRetention(30)).toBe(30);
    });
  });
});
