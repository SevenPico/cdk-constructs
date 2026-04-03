import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { makeContext } from '@sevenpico/cdk-context';
import { KinesisStream } from '../src/kinesis-stream';

function makeStack(): Stack {
  const app = new App();
  return new Stack(app, 'TestStack');
}

const CONTEXT = makeContext({ namespace: 'acme', environment: 'dev', stage: 'app' });

describe('Example: minimal', () => {
  let template: Template;
  beforeAll(() => {
    const stack = makeStack();
    new KinesisStream(stack, 'Stream', { context: CONTEXT });
    template = Template.fromStack(stack);
  });
  test('creates exactly 1 Kinesis stream', () => {
    template.resourceCountIs('AWS::Kinesis::Stream', 1);
  });
});

describe('Example: comprehensive', () => {
  let template: Template;
  beforeAll(() => {
    const stack = makeStack();
    new KinesisStream(stack, 'Stream', {
      context: CONTEXT,
      shardCount: 2,
      retentionPeriodHours: 48,
      streamMode: 'PROVISIONED',
      encryptionType: 'KMS',
      consumerCount: 1,
    });
    template = Template.fromStack(stack);
  });
  test('creates exactly 1 Kinesis stream', () => {
    template.resourceCountIs('AWS::Kinesis::Stream', 1);
  });
  test('creates a registered consumer when consumerCount is set', () => {
    template.resourceCountIs('AWS::Kinesis::StreamConsumer', 1);
  });
});

describe('Example: disabled', () => {
  let template: Template;
  beforeAll(() => {
    const stack = makeStack();
    new KinesisStream(stack, 'Stream', {
      context: makeContext({ namespace: 'acme', environment: 'dev', stage: 'app', enabled: false }),
    });
    template = Template.fromStack(stack);
  });
  test('creates zero Kinesis streams when disabled', () => {
    template.resourceCountIs('AWS::Kinesis::Stream', 0);
  });
});
