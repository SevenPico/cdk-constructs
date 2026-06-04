import { makeContext } from '@sevenpico/cdk-context';
import { App, Stack } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { SfnErrorNotification } from '../src/sfn-error-notification';

// Fixture values matching examples/*/cdk.json
const FIXTURE = {
  context: makeContext({ namespace: 'acme', environment: 'dev', stage: 'app' }),
  stateMachineArn: 'arn:aws:states:us-east-1:123456789012:stateMachine:acme-dev-app-processor',
  rateAlarmSnsTopicArn: 'arn:aws:sns:us-east-1:123456789012:acme-dev-app-alarms',
  volumeAlarmSnsTopicArn: 'arn:aws:sns:us-east-1:123456789012:acme-dev-app-alarms',
};

const KMS_KEY_ARN = 'arn:aws:kms:us-east-1:123456789012:key/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

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
    new SfnErrorNotification(stack, 'SfnMonitor', FIXTURE);
    template = Template.fromStack(stack);
  });

  test('creates one SQS queue (DLQ)', () => {
    template.resourceCountIs('AWS::SQS::Queue', 1);
  });

  test('DLQ name is derived from context', () => {
    template.hasResourceProperties('AWS::SQS::Queue', {
      QueueName: 'acme-dev-app-dlq',
    });
  });

  test('DLQ uses 7-day retention by default', () => {
    template.hasResourceProperties('AWS::SQS::Queue', {
      MessageRetentionPeriod: 604800,
    });
  });

  test('creates two CloudWatch alarms', () => {
    template.resourceCountIs('AWS::CloudWatch::Alarm', 2);
  });

  test('rate alarm name is derived from context', () => {
    template.hasResourceProperties('AWS::CloudWatch::Alarm', {
      AlarmName: 'acme-dev-app-dlq-rate',
    });
  });

  test('volume alarm name is derived from context', () => {
    template.hasResourceProperties('AWS::CloudWatch::Alarm', {
      AlarmName: 'acme-dev-app-dlq-volume',
    });
  });

  test('creates one EventBridge rule', () => {
    template.resourceCountIs('AWS::Events::Rule', 1);
  });

  test('EventBridge rule name is derived from context', () => {
    template.hasResourceProperties('AWS::Events::Rule', {
      Name: 'acme-dev-app-failed',
    });
  });

  test('EventBridge rule captures FAILED, TIMED_OUT, and ABORTED executions', () => {
    template.hasResourceProperties('AWS::Events::Rule', {
      EventPattern: Match.objectLike({
        'source': ['aws.states'],
        'detail-type': ['Step Functions Execution Status Change'],
        'detail': {
          status: ['FAILED', 'TIMED_OUT', 'ABORTED'],
          stateMachineArn: [FIXTURE.stateMachineArn],
        },
      }),
    });
  });

  test('creates one EventBridge Pipe', () => {
    template.resourceCountIs('AWS::Pipes::Pipe', 1);
  });

  test('Pipe name is derived from context', () => {
    template.hasResourceProperties('AWS::Pipes::Pipe', {
      Name: 'acme-dev-app-pipe',
    });
  });

  test('Pipe target is the state machine ARN', () => {
    template.hasResourceProperties('AWS::Pipes::Pipe', {
      Target: FIXTURE.stateMachineArn,
    });
  });

  test('context Owner tag applied to DLQ', () => {
    const ctx = makeContext({
      namespace: 'acme',
      environment: 'dev',
      stage: 'app',
      tags: { Owner: 'platform-team' },
    });
    const stack = makeStack();
    new SfnErrorNotification(stack, 'SfnMonitor', { ...FIXTURE, context: ctx });
    const t = Template.fromStack(stack);
    t.hasResourceProperties('AWS::SQS::Queue', {
      Tags: Match.arrayWith([
        Match.objectLike({ Key: 'Owner', Value: 'platform-team' }),
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
    new SfnErrorNotification(stack, 'SfnMonitor', {
      ...FIXTURE,
      sqsKmsKeyArn: KMS_KEY_ARN,
      sqsQueueName: 'acme-dev-app-processor-dlq',
      sqsMessageRetentionSeconds: 1209600,
      sqsVisibilityTimeoutSeconds: 30,
      alarmPeriodSeconds: 300,
      alarmEvaluationPeriods: 3,
      alarmDatapointsToAlarm: 2,
      rateAlarmName: 'acme-dev-app-processor-error-rate',
      volumeAlarmName: 'acme-dev-app-processor-error-volume',
      eventbridgePipeName: 'acme-dev-app-processor-replay',
      eventbridgePipeBatchSize: 5,
      eventbridgePipeLogLevel: 'INFO',
      cloudwatchLogRetentionDays: 30,
      targetStepFunctionInputTemplate: '<$.detail.input>',
      eventbridgeRuleName: 'acme-dev-app-processor-failed',
    });
    template = Template.fromStack(stack);
  });

  test('DLQ uses custom queue name', () => {
    template.hasResourceProperties('AWS::SQS::Queue', {
      QueueName: 'acme-dev-app-processor-dlq',
    });
  });

  test('DLQ uses custom retention period (14 days)', () => {
    template.hasResourceProperties('AWS::SQS::Queue', {
      MessageRetentionPeriod: 1209600,
    });
  });

  test('DLQ uses custom visibility timeout', () => {
    template.hasResourceProperties('AWS::SQS::Queue', {
      VisibilityTimeout: 30,
    });
  });

  test('rate alarm uses custom name', () => {
    template.hasResourceProperties('AWS::CloudWatch::Alarm', {
      AlarmName: 'acme-dev-app-processor-error-rate',
    });
  });

  test('volume alarm uses custom name', () => {
    template.hasResourceProperties('AWS::CloudWatch::Alarm', {
      AlarmName: 'acme-dev-app-processor-error-volume',
    });
  });

  test('alarms use custom evaluation periods', () => {
    template.hasResourceProperties('AWS::CloudWatch::Alarm', {
      AlarmName: 'acme-dev-app-processor-error-rate',
      EvaluationPeriods: 3,
      DatapointsToAlarm: 2,
    });
  });

  test('EventBridge rule uses custom name', () => {
    template.hasResourceProperties('AWS::Events::Rule', {
      Name: 'acme-dev-app-processor-failed',
    });
  });

  test('Pipe uses custom name', () => {
    template.hasResourceProperties('AWS::Pipes::Pipe', {
      Name: 'acme-dev-app-processor-replay',
    });
  });

  test('Pipe uses custom batch size', () => {
    template.hasResourceProperties('AWS::Pipes::Pipe', {
      SourceParameters: {
        SqsQueueParameters: { BatchSize: 5 },
      },
    });
  });
});

// ---------------------------------------------------------------------------
// Example scenario: disabled
// ---------------------------------------------------------------------------

describe('Example: disabled', () => {
  test('no resources created when context is disabled', () => {
    const stack = makeStack();
    new SfnErrorNotification(stack, 'SfnMonitor', {
      ...FIXTURE,
      context: makeContext({ namespace: 'acme', environment: 'dev', stage: 'app', enabled: false }),
    });
    const template = Template.fromStack(stack);
    expect(Object.keys(template.toJSON().Resources ?? {})).toHaveLength(0);
  });

  test('disabled construct exposes no DLQ', () => {
    const stack = makeStack();
    const construct = new SfnErrorNotification(stack, 'SfnMonitor', {
      ...FIXTURE,
      context: makeContext({ namespace: 'acme', environment: 'dev', stage: 'app', enabled: false }),
    });
    expect(construct.deadLetterQueue).toBeUndefined();
  });

  test('disabled construct exposes no alarms', () => {
    const stack = makeStack();
    const construct = new SfnErrorNotification(stack, 'SfnMonitor', {
      ...FIXTURE,
      context: makeContext({ namespace: 'acme', environment: 'dev', stage: 'app', enabled: false }),
    });
    expect(construct.rateAlarm).toBeUndefined();
    expect(construct.volumeAlarm).toBeUndefined();
  });
});
