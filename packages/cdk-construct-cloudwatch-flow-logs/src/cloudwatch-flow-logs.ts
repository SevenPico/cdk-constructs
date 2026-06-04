import { contextTags, isEnabled } from '@sevenpico/cdk-context';
import {
  Tags,
  aws_ec2 as ec2,
  aws_logs as logs,
  aws_iam as iam,
  aws_kms as kms,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  logGroupProps,
  flowLogRoleName,
  flowLogsPolicyStatement,
  flowLogProps,
} from './cloudwatch-flow-logs-fns';
import { CloudwatchFlowLogsProps } from './cloudwatch-flow-logs-types';

export class CloudwatchFlowLogs extends Construct {
  public readonly logGroup?: logs.LogGroup;
  public readonly flowLog?: ec2.FlowLog;
  public readonly role?: iam.Role;

  constructor(scope: Construct, id: string, props: CloudwatchFlowLogsProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    const encryptionKey = props.logGroupKmsKeyArn
      ? kms.Key.fromKeyArn(this, 'KmsKey', props.logGroupKmsKeyArn)
      : undefined;

    this.logGroup = new logs.LogGroup(this, 'LogGroup', {
      ...logGroupProps(props.context, props),
      encryptionKey,
    });

    this.role = new iam.Role(this, 'Role', {
      roleName: flowLogRoleName(props.context),
      assumedBy: new iam.ServicePrincipal('vpc-flow-logs.amazonaws.com'),
    });
    this.role.addToPolicy(flowLogsPolicyStatement());

    const vpc = ec2.Vpc.fromLookup(this, 'Vpc', { vpcId: props.vpcId });
    this.flowLog = new ec2.FlowLog(this, 'FlowLog', flowLogProps(props, this.logGroup, this.role, vpc));

    Object.entries(contextTags(props.context)).forEach(([k, v]) =>
      Tags.of(this).add(k, v),
    );
  }
}
