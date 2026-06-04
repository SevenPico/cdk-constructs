import { makeContext } from '@sevenpico/cdk-context';
import { App, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ruleName, ruleProps, buildTarget } from '../src/cloudwatch-events-fns';
import { CloudwatchEventRule } from '../src/cloudwatch-events-types';

describe('CloudwatchEvents pure functions', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'monitor' });

  const baseRule: CloudwatchEventRule = {
    name: 'ec2-state',
    targets: [{ type: 'sns', arn: 'arn:aws:sns:us-east-1:123456789012:topic' }],
  };

  test('ruleName joins contextId and rule name', () => {
    expect(ruleName(ctx, baseRule)).toBe('7p-prod-monitor-ec2-state');
  });

  test('ruleProps includes schedule when provided', () => {
    const rule: CloudwatchEventRule = { ...baseRule, schedule: 'rate(5 minutes)' };
    const props = ruleProps(ctx, rule);
    expect(props.schedule).toBeDefined();
    expect(props.ruleName).toBe('7p-prod-monitor-ec2-state');
  });

  test('ruleProps includes eventPattern when provided', () => {
    const rule: CloudwatchEventRule = {
      ...baseRule,
      eventPattern: '{"source":["aws.ec2"]}',
    };
    const props = ruleProps(ctx, rule);
    expect(props.eventPattern).toEqual({ source: ['aws.ec2'] });
  });

  test('ruleProps has no schedule or eventPattern when neither provided', () => {
    const props = ruleProps(ctx, baseRule);
    expect(props.schedule).toBeUndefined();
    expect(props.eventPattern).toBeUndefined();
    expect(props.enabled).toBe(true);
  });

  test('ruleProps includes description when provided', () => {
    const rule: CloudwatchEventRule = { ...baseRule, description: 'Monitors EC2 state changes' };
    const props = ruleProps(ctx, rule);
    expect(props.description).toBe('Monitors EC2 state changes');
  });
});

describe('buildTarget', () => {
  let scope: Construct;

  beforeEach(() => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');
    scope = stack;
  });

  test('throws for unsupported target type', () => {
    expect(() => {
      buildTarget(scope, 'bad-target', {
        type: 'kinesis',
        arn: 'arn:aws:kinesis:us-east-1:123456789012:stream/my-stream',
      });
    }).toThrow('Unsupported CloudwatchEventTarget type: kinesis');
  });

  test('sns target with inputTransformer returns SnsTopic target', () => {
    const target = buildTarget(scope, 'sns-t', {
      type: 'sns',
      arn: 'arn:aws:sns:us-east-1:123456789012:my-topic',
      inputTransformer: {
        inputPathsMap: { instance: '$.detail.instance-id' },
        inputTemplate: 'Instance <instance> changed state',
      },
    });
    expect(target).toBeDefined();
  });

  test('lambda target with inputTransformer returns LambdaFunction target', () => {
    const target = buildTarget(scope, 'lambda-t', {
      type: 'lambda',
      arn: 'arn:aws:lambda:us-east-1:123456789012:function:my-fn',
      inputTransformer: {
        inputPathsMap: {},
        inputTemplate: '{"key":"value"}',
      },
    });
    expect(target).toBeDefined();
  });

  test('sqs target with inputTransformer returns SqsQueue target', () => {
    const target = buildTarget(scope, 'sqs-t', {
      type: 'sqs',
      arn: 'arn:aws:sqs:us-east-1:123456789012:my-queue',
      inputTransformer: {
        inputPathsMap: {},
        inputTemplate: '{"key":"value"}',
      },
    });
    expect(target).toBeDefined();
  });
});
