import { makeContext } from '@sevenpico/cdk-context';
import { App, Stack, aws_logs as logs, aws_stepfunctions as sfn } from 'aws-cdk-lib';
import {
  stateMachineName,
  logGroupName,
  stateMachineType,
  loggingConfig,
  mapLogLevel,
  buildTrustDocument,
  mergePolicyDocuments,
} from '../src/step-functions-fns';
import { StepFunctionsProps } from '../src/step-functions-types';

const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'workflow' });

const baseProps: StepFunctionsProps = {
  context: ctx,
  definition: { StartAt: 'Pass', States: { Pass: { Type: 'Pass', End: true } } },
  roleDescription: 'test role',
};

describe('stateMachineName', () => {
  test('returns context ID by default', () => {
    expect(stateMachineName(ctx, baseProps)).toBe('7p-prod-workflow');
  });

  test('returns custom name when provided', () => {
    expect(stateMachineName(ctx, { ...baseProps, stateMachineName: 'my-workflow' })).toBe('my-workflow');
  });
});

describe('logGroupName', () => {
  test('returns /aws/states/{contextId} by default', () => {
    expect(logGroupName(ctx, baseProps)).toBe('/aws/states/7p-prod-workflow');
  });

  test('returns custom log group name when provided', () => {
    expect(logGroupName(ctx, { ...baseProps, logGroupName: '/custom/logs' })).toBe('/custom/logs');
  });
});

describe('stateMachineType', () => {
  test('returns STANDARD by default', () => {
    expect(stateMachineType(baseProps)).toBe(sfn.StateMachineType.STANDARD);
  });

  test('returns EXPRESS when type is EXPRESS', () => {
    expect(stateMachineType({ ...baseProps, type: 'EXPRESS' })).toBe(sfn.StateMachineType.EXPRESS);
  });

  test('returns STANDARD for unknown type', () => {
    expect(stateMachineType({ ...baseProps, type: 'UNKNOWN' })).toBe(sfn.StateMachineType.STANDARD);
  });
});

describe('mapLogLevel', () => {
  test('maps ALL correctly', () => {
    expect(mapLogLevel('ALL')).toBe(sfn.LogLevel.ALL);
  });

  test('maps ERROR correctly', () => {
    expect(mapLogLevel('ERROR')).toBe(sfn.LogLevel.ERROR);
  });

  test('maps FATAL correctly', () => {
    expect(mapLogLevel('FATAL')).toBe(sfn.LogLevel.FATAL);
  });

  test('maps OFF correctly', () => {
    expect(mapLogLevel('OFF')).toBe(sfn.LogLevel.OFF);
  });

  test('defaults to OFF for unknown', () => {
    expect(mapLogLevel('UNKNOWN')).toBe(sfn.LogLevel.OFF);
  });
});

describe('loggingConfig', () => {
  test('returns defaults when no config provided', () => {
    const app = new App();
    const stack = new Stack(app, 'Test');
    const lg = new logs.LogGroup(stack, 'LG');
    const result = loggingConfig(lg);
    expect(result.destination).toBe(lg);
    expect(result.includeExecutionData).toBe(false);
    expect(result.level).toBe(sfn.LogLevel.OFF);
  });

  test('respects config overrides', () => {
    const app = new App();
    const stack = new Stack(app, 'Test');
    const lg = new logs.LogGroup(stack, 'LG');
    const result = loggingConfig(lg, { includeExecutionData: true, level: 'ALL' });
    expect(result.includeExecutionData).toBe(true);
    expect(result.level).toBe(sfn.LogLevel.ALL);
  });
});

describe('buildTrustDocument', () => {
  test('defaults to states.amazonaws.com service principal', () => {
    const doc = buildTrustDocument();
    const json = doc.toJSON();
    // CDK tokenizes ServicePrincipal, so check it contains the token reference
    expect(JSON.stringify(json.Statement[0].Principal.Service)).toContain('states.amazonaws.com');
  });

  test('uses custom principals when provided', () => {
    const doc = buildTrustDocument({ AWS: ['arn:aws:iam::123456789012:root'] });
    const json = doc.toJSON();
    expect(json.Statement[0].Principal.AWS).toBe('arn:aws:iam::123456789012:root');
  });
});

describe('mergePolicyDocuments', () => {
  test('returns undefined for empty array', () => {
    expect(mergePolicyDocuments([])).toBeUndefined();
  });

  test('merges statements from multiple documents', () => {
    const doc1 = JSON.stringify({ Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }] });
    const doc2 = JSON.stringify({ Statement: [{ Effect: 'Allow', Action: 'logs:PutLogEvents', Resource: '*' }] });
    const result = mergePolicyDocuments([doc1, doc2]);
    expect(result).toBeDefined();
    const json = result!.toJSON();
    expect(json.Statement).toHaveLength(2);
  });
});
