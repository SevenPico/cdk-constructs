import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { makeContext } from '@sevenpico/cdk-context';
import { CloudwatchFlowLogs } from '../src/cloudwatch-flow-logs';

function makeStack(): Stack {
  const app = new App();
  return new Stack(app, 'TestStack', {
    env: { account: '123456789012', region: 'us-east-1' },
  });
}

const CONTEXT = makeContext({ namespace: 'acme', environment: 'dev', stage: 'app' });
const VPC_ID = 'vpc-0123456789abcdef0';

describe('Example: minimal', () => {
  let template: Template;
  beforeAll(() => {
    const stack = makeStack();
    new CloudwatchFlowLogs(stack, 'FlowLogs', { context: CONTEXT, vpcId: VPC_ID });
    template = Template.fromStack(stack);
  });
  test('creates exactly 1 log group', () => {
    template.resourceCountIs('AWS::Logs::LogGroup', 1);
  });
  test('creates exactly 1 IAM role', () => {
    template.resourceCountIs('AWS::IAM::Role', 1);
  });
  test('creates exactly 1 flow log', () => {
    template.resourceCountIs('AWS::EC2::FlowLog', 1);
  });
});

describe('Example: comprehensive', () => {
  let template: Template;
  beforeAll(() => {
    const stack = makeStack();
    new CloudwatchFlowLogs(stack, 'FlowLogs', {
      context: CONTEXT,
      vpcId: VPC_ID,
      trafficType: 'REJECT',
      cloudwatchLogRetentionDays: 90,
    });
    template = Template.fromStack(stack);
  });
  test('creates exactly 1 log group', () => {
    template.resourceCountIs('AWS::Logs::LogGroup', 1);
  });
  test('creates exactly 1 flow log', () => {
    template.resourceCountIs('AWS::EC2::FlowLog', 1);
  });
  test('flow log traffic type is REJECT', () => {
    template.hasResourceProperties('AWS::EC2::FlowLog', {
      TrafficType: 'REJECT',
    });
  });
});

describe('Example: disabled', () => {
  let template: Template;
  beforeAll(() => {
    const stack = makeStack();
    new CloudwatchFlowLogs(stack, 'FlowLogs', {
      context: makeContext({ namespace: 'acme', environment: 'dev', stage: 'app', enabled: false }),
      vpcId: VPC_ID,
    });
    template = Template.fromStack(stack);
  });
  test('creates zero flow logs when disabled', () => {
    template.resourceCountIs('AWS::EC2::FlowLog', 0);
  });
  test('creates zero log groups when disabled', () => {
    template.resourceCountIs('AWS::Logs::LogGroup', 0);
  });
});
