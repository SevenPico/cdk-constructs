import { App, Stack } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { makeContext } from '@sevenpico/cdk-context';
import { ExpressSfnErrorNotification } from '../src/express-sfn-error-notification';

// Fixture values matching examples/*/cdk.json
const CONTEXT = makeContext({ namespace: 'acme', environment: 'dev', stage: 'app' });
const PROCESSOR_ARN = 'arn:aws:states:us-east-1:123456789012:stateMachine:acme-dev-app-processor';
const VALIDATOR_ARN = 'arn:aws:states:us-east-1:123456789012:stateMachine:acme-dev-app-validator';
const ALARMS_SNS_ARN = 'arn:aws:sns:us-east-1:123456789012:acme-dev-app-alarms';
const KMS_KEY_ARN = 'arn:aws:kms:us-east-1:123456789012:key/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const KMS_KEY_ID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

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
    new ExpressSfnErrorNotification(stack, 'ExpressSfnMonitor', {
      context: CONTEXT,
      stepFunctions: {
        processor: { arn: PROCESSOR_ARN },
      },
      rateAlarmSnsTopicArn: ALARMS_SNS_ARN,
      volumeAlarmSnsTopicArn: ALARMS_SNS_ARN,
    });
    template = Template.fromStack(stack);
  });

  test('creates one SQS queue (DLQ)', () => {
    template.resourceCountIs('AWS::SQS::Queue', 1);
  });

  test('DLQ name is derived from context and machine key', () => {
    template.hasResourceProperties('AWS::SQS::Queue', {
      QueueName: 'acme-dev-app-processor-dlq',
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

  test('rate alarm name is derived from context and machine key', () => {
    template.hasResourceProperties('AWS::CloudWatch::Alarm', {
      AlarmName: 'acme-dev-app-processor-dlq-rate',
    });
  });

  test('volume alarm name is derived from context and machine key', () => {
    template.hasResourceProperties('AWS::CloudWatch::Alarm', {
      AlarmName: 'acme-dev-app-processor-dlq-volume',
    });
  });

  test('creates one EventBridge Pipe', () => {
    template.resourceCountIs('AWS::Pipes::Pipe', 1);
  });

  test('Pipe name is derived from context and machine key', () => {
    template.hasResourceProperties('AWS::Pipes::Pipe', {
      Name: 'acme-dev-app-processor-pipe',
    });
  });

  test('Pipe target is the processor state machine ARN', () => {
    template.hasResourceProperties('AWS::Pipes::Pipe', {
      Target: PROCESSOR_ARN,
    });
  });

  test('context Owner tag applied to DLQ', () => {
    const ctx = makeContext({
      namespace: 'acme', environment: 'dev', stage: 'app',
      tags: { Owner: 'platform-team' },
    });
    const stack = makeStack();
    new ExpressSfnErrorNotification(stack, 'ExpressSfnMonitor', {
      context: ctx,
      stepFunctions: { processor: { arn: PROCESSOR_ARN } },
      rateAlarmSnsTopicArn: ALARMS_SNS_ARN,
      volumeAlarmSnsTopicArn: ALARMS_SNS_ARN,
    });
    const t = Template.fromStack(stack);
    t.hasResourceProperties('AWS::SQS::Queue', {
      Tags: Match.arrayWith([
        Match.objectLike({ Key: 'Owner', Value: 'platform-team' }),
      ]),
    });
  });
});

// ---------------------------------------------------------------------------
// Example scenario: multi-target
// ---------------------------------------------------------------------------

describe('Example: multi-target', () => {
  let template: Template;

  beforeAll(() => {
    const stack = makeStack();
    new ExpressSfnErrorNotification(stack, 'ExpressSfnMonitor', {
      context: CONTEXT,
      stepFunctions: {
        processor: { arn: PROCESSOR_ARN },
        validator: { arn: VALIDATOR_ARN },
      },
      rateAlarmSnsTopicArn: ALARMS_SNS_ARN,
      volumeAlarmSnsTopicArn: ALARMS_SNS_ARN,
    });
    template = Template.fromStack(stack);
  });

  test('creates two SQS queues (one per machine)', () => {
    template.resourceCountIs('AWS::SQS::Queue', 2);
  });

  test('creates four CloudWatch alarms (rate + volume per machine)', () => {
    template.resourceCountIs('AWS::CloudWatch::Alarm', 4);
  });

  test('creates two EventBridge Pipes', () => {
    template.resourceCountIs('AWS::Pipes::Pipe', 2);
  });

  test('processor DLQ exists', () => {
    template.hasResourceProperties('AWS::SQS::Queue', {
      QueueName: 'acme-dev-app-processor-dlq',
    });
  });

  test('validator DLQ exists', () => {
    template.hasResourceProperties('AWS::SQS::Queue', {
      QueueName: 'acme-dev-app-validator-dlq',
    });
  });

  test('processor rate alarm exists', () => {
    template.hasResourceProperties('AWS::CloudWatch::Alarm', {
      AlarmName: 'acme-dev-app-processor-dlq-rate',
    });
  });

  test('validator rate alarm exists', () => {
    template.hasResourceProperties('AWS::CloudWatch::Alarm', {
      AlarmName: 'acme-dev-app-validator-dlq-rate',
    });
  });

  test('processor pipe targets processor state machine', () => {
    template.hasResourceProperties('AWS::Pipes::Pipe', {
      Name: 'acme-dev-app-processor-pipe',
      Target: PROCESSOR_ARN,
    });
  });

  test('validator pipe targets validator state machine', () => {
    template.hasResourceProperties('AWS::Pipes::Pipe', {
      Name: 'acme-dev-app-validator-pipe',
      Target: VALIDATOR_ARN,
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
    new ExpressSfnErrorNotification(stack, 'ExpressSfnMonitor', {
      context: CONTEXT,
      stepFunctions: {
        processor: {
          arn: PROCESSOR_ARN,
          sqsQueueName: 'acme-dev-app-processor-dlq',
          rateAlarmName: 'acme-dev-app-processor-error-rate',
          volumeAlarmName: 'acme-dev-app-processor-error-volume',
        },
      },
      rateAlarmSnsTopicArn: ALARMS_SNS_ARN,
      volumeAlarmSnsTopicArn: ALARMS_SNS_ARN,
      sqsKmsConfig: { keyId: KMS_KEY_ID, keyArn: KMS_KEY_ARN },
      sqsMessageRetentionSeconds: 1209600,
      sqsVisibilityTimeoutSeconds: 60,
      alarmPeriodSeconds: 300,
      alarmEvaluationPeriods: 3,
      alarmDatapointsToAlarm: 2,
      eventbridgePipeBatchSize: 5,
      eventbridgePipeLogLevel: 'INFO',
      cloudwatchLogRetentionDays: 30,
      targetStepFunctionInputTemplate: '<$.detail.input>',
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
      VisibilityTimeout: 60,
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
    new ExpressSfnErrorNotification(stack, 'ExpressSfnMonitor', {
      context: makeContext({ namespace: 'acme', environment: 'dev', stage: 'app', enabled: false }),
      stepFunctions: { processor: { arn: PROCESSOR_ARN } },
      rateAlarmSnsTopicArn: ALARMS_SNS_ARN,
      volumeAlarmSnsTopicArn: ALARMS_SNS_ARN,
    });
    const template = Template.fromStack(stack);
    expect(Object.keys(template.toJSON().Resources ?? {})).toHaveLength(0);
  });

  test('disabled construct exposes empty deadLetterQueues map', () => {
    const stack = makeStack();
    const construct = new ExpressSfnErrorNotification(stack, 'ExpressSfnMonitor', {
      context: makeContext({ namespace: 'acme', environment: 'dev', stage: 'app', enabled: false }),
      stepFunctions: { processor: { arn: PROCESSOR_ARN } },
      rateAlarmSnsTopicArn: ALARMS_SNS_ARN,
      volumeAlarmSnsTopicArn: ALARMS_SNS_ARN,
    });
    expect(Object.keys(construct.deadLetterQueues)).toHaveLength(0);
  });
});
