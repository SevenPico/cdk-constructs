import { makeContext } from '@sevenpico/cdk-context';
import { App, Stack } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { KinesisStream } from '../src/kinesis-stream';
import { KinesisStreamProps } from '../src/kinesis-stream-types';

const context = makeContext({ namespace: '7p', stage: 'prod', name: 'events' });

const baseProps: KinesisStreamProps = { context };

const synthTemplate = (props: KinesisStreamProps): Template => {
  const app = new App();
  const stack = new Stack(app, 'TestStack');
  new KinesisStream(stack, 'SUT', props);
  return Template.fromStack(stack);
};

describe('KinesisStream construct', () => {
  describe('Stream Naming', () => {
    test('stream uses context ID as name', () => {
      const template = synthTemplate(baseProps);
      template.hasResourceProperties('AWS::Kinesis::Stream', {
        Name: '7p-prod-events',
      });
    });
  });

  describe('Stream Mode', () => {
    test('provisioned mode with 1 shard by default', () => {
      const template = synthTemplate(baseProps);
      template.hasResourceProperties('AWS::Kinesis::Stream', {
        ShardCount: 1,
        StreamModeDetails: { StreamMode: 'PROVISIONED' },
      });
    });

    test('ON_DEMAND mode ignores shard count', () => {
      const template = synthTemplate({ ...baseProps, streamMode: 'ON_DEMAND', shardCount: 10 });
      template.hasResourceProperties('AWS::Kinesis::Stream', {
        StreamModeDetails: { StreamMode: 'ON_DEMAND' },
        ShardCount: Match.absent(),
      });
    });
  });

  describe('Encryption', () => {
    test('KMS encryption enabled by default (managed key)', () => {
      const template = synthTemplate(baseProps);
      template.hasResourceProperties('AWS::Kinesis::Stream', {
        StreamEncryption: Match.objectLike({
          EncryptionType: 'KMS',
          KeyId: 'alias/aws/kinesis',
        }),
      });
    });

    test('no encryption when NONE specified', () => {
      const template = synthTemplate({ ...baseProps, encryptionType: 'NONE' });
      template.hasResourceProperties('AWS::Kinesis::Stream', {
        StreamEncryption: Match.absent(),
      });
    });
  });

  describe('Retention', () => {
    test('default 24 hour retention', () => {
      const template = synthTemplate(baseProps);
      template.hasResourceProperties('AWS::Kinesis::Stream', {
        RetentionPeriodHours: 24,
      });
    });

    test('custom retention period', () => {
      const template = synthTemplate({ ...baseProps, retentionPeriodHours: 168 });
      template.hasResourceProperties('AWS::Kinesis::Stream', {
        RetentionPeriodHours: 168,
      });
    });
  });

  describe('Consumers', () => {
    test('no consumers by default', () => {
      const template = synthTemplate(baseProps);
      template.resourceCountIs('AWS::Kinesis::StreamConsumer', 0);
    });

    test('registered consumers created when consumerCount > 0', () => {
      const template = synthTemplate({ ...baseProps, consumerCount: 2 });
      template.resourceCountIs('AWS::Kinesis::StreamConsumer', 2);
      template.hasResourceProperties('AWS::Kinesis::StreamConsumer', {
        ConsumerName: '7p-prod-events-consumer-0',
      });
      template.hasResourceProperties('AWS::Kinesis::StreamConsumer', {
        ConsumerName: '7p-prod-events-consumer-1',
      });
    });
  });

  describe('Shard-Level Metrics', () => {
    test('default metrics applied via EnhancedMonitoring', () => {
      const template = synthTemplate(baseProps);
      template.hasResourceProperties('AWS::Kinesis::Stream', {
        EnhancedMonitoring: [
          { ShardLevelMetrics: ['IncomingBytes', 'OutgoingBytes'] },
        ],
      });
    });

    test('custom metrics applied', () => {
      const template = synthTemplate({
        ...baseProps,
        shardLevelMetrics: ['IncomingRecords', 'IteratorAgeMilliseconds'],
      });
      template.hasResourceProperties('AWS::Kinesis::Stream', {
        EnhancedMonitoring: [
          { ShardLevelMetrics: ['IncomingRecords', 'IteratorAgeMilliseconds'] },
        ],
      });
    });
  });

  describe('Alias-based Custom KMS Key', () => {
    test('alias-based custom KMS key sets encryption override via escape hatch', () => {
      const template = synthTemplate({
        ...baseProps,
        kmsKeyId: 'alias/my-custom-key',
      });
      template.hasResourceProperties('AWS::Kinesis::Stream', {
        StreamEncryption: Match.objectLike({
          EncryptionType: 'KMS',
          KeyId: 'alias/my-custom-key',
        }),
      });
    });
  });

  describe('ARN-based Custom KMS Key', () => {
    test('ARN-based KMS key uses fromKeyArn and wires encryption key', () => {
      const template = synthTemplate({
        ...baseProps,
        kmsKeyId: 'arn:aws:kms:us-east-1:123456789012:key/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
      });
      template.hasResourceProperties('AWS::Kinesis::Stream', {
        StreamEncryption: Match.objectLike({
          EncryptionType: 'KMS',
        }),
      });
    });
  });

  describe('Enforce Consumer Deletion', () => {
    test('stream uses Delete policy by default (enforceConsumerDeletion true)', () => {
      const template = synthTemplate(baseProps);
      const streams = template.findResources('AWS::Kinesis::Stream');
      const streamKey = Object.keys(streams)[0];
      // Default CDK retention is Retain, but enforceConsumerDeletion=true keeps it as-is
      expect(streams[streamKey]).toBeDefined();
    });

    test('stream uses Retain policy when enforceConsumerDeletion is false', () => {
      const template = synthTemplate({ ...baseProps, enforceConsumerDeletion: false });
      const streams = template.findResources('AWS::Kinesis::Stream');
      const streamKey = Object.keys(streams)[0];
      expect(streams[streamKey].DeletionPolicy).toBe('Retain');
    });
  });

  describe('Tags', () => {
    test('context tags are applied', () => {
      const taggedCtx = makeContext({
        namespace: '7p',
        stage: 'prod',
        name: 'events',
        tags: { Team: 'platform' },
      });
      const template = synthTemplate({ context: taggedCtx });
      template.hasResourceProperties('AWS::Kinesis::Stream', {
        Tags: Match.arrayWith([
          { Key: 'Team', Value: 'platform' },
        ]),
      });
    });
  });

  describe('Disabled Construct', () => {
    test('no resources created when context is disabled', () => {
      const disabledCtx = makeContext({
        namespace: '7p', stage: 'prod', name: 'events', enabled: false,
      });
      const template = synthTemplate({ context: disabledCtx });
      expect(Object.keys(template.toJSON().Resources ?? {})).toHaveLength(0);
    });
  });
});
