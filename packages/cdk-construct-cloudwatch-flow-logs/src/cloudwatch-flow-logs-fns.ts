import { Context, contextId } from '@sevenpico/cdk-context';
import {
  aws_ec2 as ec2,
  aws_logs as logs,
  aws_iam as iam,
  RemovalPolicy,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CloudwatchFlowLogsProps } from './cloudwatch-flow-logs-types';

export const logGroupName = (ctx: Context): string =>
  `/aws/vpc/flowlogs/${contextId(ctx)}`;

export const flowLogRoleName = (ctx: Context): string =>
  `${contextId(ctx)}-flow-logs-role`;

export const flowLogsPolicyStatement = (): iam.PolicyStatement =>
  new iam.PolicyStatement({
    effect: iam.Effect.ALLOW,
    actions: [
      'logs:CreateLogGroup',
      'logs:CreateLogStream',
      'logs:PutLogEvents',
      'logs:DescribeLogGroups',
      'logs:DescribeLogStreams',
    ],
    resources: ['*'],
  });

export const logGroupProps = (
  ctx: Context,
  props: CloudwatchFlowLogsProps,
): logs.LogGroupProps => ({
  logGroupName: logGroupName(ctx),
  retention: (props.cloudwatchLogRetentionDays ?? 365) as logs.RetentionDays,
  removalPolicy: RemovalPolicy.DESTROY,
});

export const mapTrafficType = (trafficType?: string): ec2.FlowLogTrafficType => {
  const map: Record<string, ec2.FlowLogTrafficType> = {
    ALL: ec2.FlowLogTrafficType.ALL,
    ACCEPT: ec2.FlowLogTrafficType.ACCEPT,
    REJECT: ec2.FlowLogTrafficType.REJECT,
  };
  return map[trafficType ?? 'ALL'] ?? ec2.FlowLogTrafficType.ALL;
};

export const flowLogProps = (
  scope: Construct,
  _ctx: Context,
  props: CloudwatchFlowLogsProps,
  logGroup: logs.LogGroup,
  role: iam.Role,
): ec2.FlowLogProps => ({
  resourceType: ec2.FlowLogResourceType.fromVpc(
    ec2.Vpc.fromLookup(scope, 'Vpc', { vpcId: props.vpcId }),
  ),
  trafficType: mapTrafficType(props.trafficType),
  destination: ec2.FlowLogDestination.toCloudWatchLogs(logGroup, role),
});
