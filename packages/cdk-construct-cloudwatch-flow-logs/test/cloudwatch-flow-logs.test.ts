import path from 'path';
import { makeContext, Context } from '@sevenpico/cdk-context';
import { App, Stack } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { loadFeature, defineFeature } from 'jest-cucumber';
import { CloudwatchFlowLogs } from '../src/cloudwatch-flow-logs';

const feature = loadFeature(path.join(__dirname, 'cloudwatch-flow-logs.feature'));

const VPC_ID = 'vpc-0123456789abcdef0';

// VPC context key used by CDK Vpc.fromLookup
const vpcContextKey = `vpc-provider:account=123456789012:filter.vpc-id=${VPC_ID}:region=us-east-1:returnAsymmetricSubnets=true`;

const vpcContextValue = {
  vpcId: VPC_ID,
  vpcCidrBlock: '10.0.0.0/16',
  availabilityZones: ['us-east-1a', 'us-east-1b'],
  publicSubnetIds: ['subnet-pub1', 'subnet-pub2'],
  publicSubnetRouteTableIds: ['rtb-pub1', 'rtb-pub2'],
  privateSubnetIds: ['subnet-priv1', 'subnet-priv2'],
  privateSubnetRouteTableIds: ['rtb-priv1', 'rtb-priv2'],
  subnetGroups: [
    {
      name: 'Public',
      type: 'Public',
      subnets: [
        { subnetId: 'subnet-pub1', cidr: '10.0.0.0/24', availabilityZone: 'us-east-1a', routeTableId: 'rtb-pub1' },
        { subnetId: 'subnet-pub2', cidr: '10.0.1.0/24', availabilityZone: 'us-east-1b', routeTableId: 'rtb-pub2' },
      ],
    },
    {
      name: 'Private',
      type: 'Private',
      subnets: [
        { subnetId: 'subnet-priv1', cidr: '10.0.2.0/24', availabilityZone: 'us-east-1a', routeTableId: 'rtb-priv1' },
        { subnetId: 'subnet-priv2', cidr: '10.0.3.0/24', availabilityZone: 'us-east-1b', routeTableId: 'rtb-priv2' },
      ],
    },
  ],
};

const makeStack = (): Stack => {
  const app = new App({
    context: {
      [vpcContextKey]: vpcContextValue,
    },
  });
  return new Stack(app, 'TestStack', {
    env: { account: '123456789012', region: 'us-east-1' },
  });
};

defineFeature(feature, test => {
  let context: Context;
  let stack: Stack;
  let template: Template;

  test('Log group created with VPC-derived name', ({ given, when, then }) => {
    given(/^a context with namespace "(.+)", stage "(.+)", name "(.+)"$/, (ns, stage, name) => {
      context = makeContext({ namespace: ns, stage, name });
    });
    when('a CloudwatchFlowLogs construct is created', () => {
      stack = makeStack();
      new CloudwatchFlowLogs(stack, 'SUT', { context, vpcId: VPC_ID });
      template = Template.fromStack(stack);
    });
    then(/^an AWS::Logs::LogGroup resource exists with LogGroupName "(.+)"$/, (logGroupName) => {
      template.hasResourceProperties('AWS::Logs::LogGroup', {
        LogGroupName: logGroupName,
      });
    });
  });

  test('Log retention defaults to 365 days', ({ given, when, then }) => {
    given(/^a context with namespace "(.+)", stage "(.+)", name "(.+)"$/, (ns, stage, name) => {
      context = makeContext({ namespace: ns, stage, name });
    });
    when('a CloudwatchFlowLogs construct is created with no cloudwatchLogRetentionDays', () => {
      stack = makeStack();
      new CloudwatchFlowLogs(stack, 'SUT', { context, vpcId: VPC_ID });
      template = Template.fromStack(stack);
    });
    then(/^the log group has RetentionInDays (\d+)$/, (days) => {
      template.hasResourceProperties('AWS::Logs::LogGroup', {
        RetentionInDays: Number(days),
      });
    });
  });

  test('KMS encryption applied to log group when logGroupKmsKeyArn provided', ({ given, when, then }) => {
    given(/^a context with namespace "(.+)", stage "(.+)", name "(.+)"$/, (ns, stage, name) => {
      context = makeContext({ namespace: ns, stage, name });
    });
    when(/^a CloudwatchFlowLogs construct is created with logGroupKmsKeyArn "(.+)"$/, (_kmsArn) => {
      stack = makeStack();
      new CloudwatchFlowLogs(stack, 'SUT', {
        context,
        vpcId: VPC_ID,
        logGroupKmsKeyArn: 'arn:aws:kms:us-east-1:123456789012:key/abc',
      });
      template = Template.fromStack(stack);
    });
    then('the log group has KmsKeyId set to that key ARN', () => {
      template.hasResourceProperties('AWS::Logs::LogGroup', {
        KmsKeyId: 'arn:aws:kms:us-east-1:123456789012:key/abc',
      });
    });
  });

  test('Traffic type defaults to ALL', ({ given, when, then }) => {
    given(/^a context with namespace "(.+)", stage "(.+)", name "(.+)"$/, (ns, stage, name) => {
      context = makeContext({ namespace: ns, stage, name });
    });
    when('a CloudwatchFlowLogs construct is created with no trafficType', () => {
      stack = makeStack();
      new CloudwatchFlowLogs(stack, 'SUT', { context, vpcId: VPC_ID });
      template = Template.fromStack(stack);
    });
    then(/^the flow log has TrafficType "(.+)"$/, (trafficType) => {
      template.hasResourceProperties('AWS::EC2::FlowLog', {
        TrafficType: trafficType,
      });
    });
  });

  test('IAM role created with CloudWatch Logs permissions', ({ given, when, then, and }) => {
    given(/^a context with namespace "(.+)", stage "(.+)", name "(.+)"$/, (ns, stage, name) => {
      context = makeContext({ namespace: ns, stage, name });
    });
    when('a CloudwatchFlowLogs construct is created', () => {
      stack = makeStack();
      new CloudwatchFlowLogs(stack, 'SUT', { context, vpcId: VPC_ID });
      template = Template.fromStack(stack);
    });
    then(/^an AWS::IAM::Role resource exists with trust policy allowing "(.+)"$/, (service) => {
      template.hasResourceProperties('AWS::IAM::Role', {
        AssumeRolePolicyDocument: Match.objectLike({
          Statement: Match.arrayWith([
            Match.objectLike({
              Principal: Match.objectLike({
                Service: service,
              }),
            }),
          ]),
        }),
      });
    });
    and(/^the role policy includes "(.+)" on "(.+)"$/, (action, resource) => {
      template.hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: Match.objectLike({
          Statement: Match.arrayWith([
            Match.objectLike({
              Action: Match.arrayWith([action]),
              Resource: resource,
            }),
          ]),
        }),
      });
    });
  });

  test('No resources created when context is disabled', ({ given, when, then, and }) => {
    given('a context with enabled false', () => {
      context = makeContext({ namespace: '7p', stage: 'prod', name: 'network', enabled: false });
    });
    when('a CloudwatchFlowLogs construct is created', () => {
      const app = new App();
      stack = new Stack(app, 'TestStack');
      new CloudwatchFlowLogs(stack, 'SUT', { context, vpcId: VPC_ID });
      template = Template.fromStack(stack);
    });
    then('no AWS::Logs::LogGroup resources exist in the stack', () => {
      template.resourceCountIs('AWS::Logs::LogGroup', 0);
    });
    and('no AWS::EC2::FlowLog resources exist in the stack', () => {
      template.resourceCountIs('AWS::EC2::FlowLog', 0);
    });
    and('no AWS::IAM::Role resources exist in the stack', () => {
      template.resourceCountIs('AWS::IAM::Role', 0);
    });
  });
});
