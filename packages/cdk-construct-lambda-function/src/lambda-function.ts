import { contextId, contextTags, isEnabled } from '@sevenpico/cdk-context';
import {
  Tags,
  Duration,
  RemovalPolicy,
  aws_lambda as lambda,
  aws_iam as iam,
  aws_logs as logs,
  aws_kms as kms,
  aws_ec2 as ec2,
  aws_efs as efs,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  functionName,
  logGroupName,
  lambdaRuntime,
  lambdaArchitecture,
  lambdaTracingConfig,
  logRetention,
  resolveCode,
} from './lambda-function-fns';
import { LambdaFunctionProps } from './lambda-function-types';

export class LambdaFunction extends Construct {
  public readonly fn?: lambda.Function;
  public readonly role?: iam.Role;
  public readonly logGroup?: logs.LogGroup;

  constructor(scope: Construct, id: string, props: LambdaFunctionProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    // Log group (created before function so we control retention)
    this.logGroup = new logs.LogGroup(this, 'LogGroup', {
      logGroupName: logGroupName(props.context, props),
      retention: logRetention(props.cloudwatchLogsRetentionDays),
      encryptionKey: props.cloudwatchLogsKmsKeyArn
        ? kms.Key.fromKeyArn(this, 'LogKey', props.cloudwatchLogsKmsKeyArn)
        : undefined,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // Execution role - use existing or create new
    let executionRole: iam.IRole;
    if (props.roleName) {
      executionRole = iam.Role.fromRoleName(this, 'ImportedRole', props.roleName);
    } else {
      this.role = new iam.Role(this, 'Role', {
        roleName: `${contextId(props.context)}-role`,
        assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      });

      this.role.addManagedPolicy(
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      );

      if (props.vpcConfig) {
        this.role.addManagedPolicy(
          iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole'),
        );
      }

      if (props.tracingMode) {
        this.role.addManagedPolicy(
          iam.ManagedPolicy.fromAwsManagedPolicyName('AWSXRayDaemonWriteAccess'),
        );
      }

      if (props.lambdaInsightsEnabled) {
        this.role.addManagedPolicy(
          iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchLambdaInsightsExecutionRolePolicy'),
        );
      }

      if (props.ssmParameterNames?.length) {
        this.role.addToPolicy(
          new iam.PolicyStatement({
            actions: ['ssm:GetParameter', 'ssm:GetParameters', 'ssm:GetParametersByPath'],
            resources: props.ssmParameterNames.map(
              (n) => `arn:aws:ssm:*:*:parameter/${n.replace(/^\//, '')}`,
            ),
          }),
        );
      }

      (props.roleSourcePolicyDocuments ?? []).forEach((doc) => {
        const parsed = JSON.parse(doc);
        (parsed.Statement ?? []).forEach((stmt: Record<string, unknown>) => {
          this.role!.addToPolicy(iam.PolicyStatement.fromJson(stmt));
        });
      });

      executionRole = this.role;
    }

    // VPC config
    let securityGroups: ec2.ISecurityGroup[] | undefined;
    if (props.vpcConfig) {
      securityGroups = props.vpcConfig.securityGroupIds.map((sgId, i) =>
        ec2.SecurityGroup.fromSecurityGroupId(this, `Sg${i}`, sgId),
      );
    }

    // EFS access point
    let filesystem: lambda.FileSystem | undefined;
    if (props.fileSystemConfig) {
      const ap = efs.AccessPoint.fromAccessPointAttributes(this, 'EfsAp', {
        accessPointArn: props.fileSystemConfig.arn,
        fileSystem: efs.FileSystem.fromFileSystemAttributes(this, 'Efs', {
          fileSystemId: 'placeholder',
          securityGroup: securityGroups?.[0]!,
        }),
      });
      filesystem = lambda.FileSystem.fromEfsAccessPoint(ap, props.fileSystemConfig.localMountPath);
    }

    // Resolve code
    const code = resolveCode(this, props);

    // Environment encryption key
    const environmentEncryption = props.kmsKeyArn
      ? kms.Key.fromKeyArn(this, 'EnvKey', props.kmsKeyArn)
      : undefined;

    this.fn = new lambda.Function(this, 'Function', {
      functionName: functionName(props.context, props),
      handler: props.handler ?? 'index.handler',
      runtime: lambdaRuntime(props.runtime),
      code,
      role: executionRole,
      description: props.description,
      memorySize: props.memorySizeMb ?? 128,
      timeout: Duration.seconds(props.timeoutSeconds ?? 3),
      reservedConcurrentExecutions:
        props.reservedConcurrentExecutions === -1
          ? undefined
          : props.reservedConcurrentExecutions,
      architecture: lambdaArchitecture(props.architecture),
      environment: props.environment?.variables,
      environmentEncryption,
      layers: (props.layers ?? []).map((arn, i) =>
        lambda.LayerVersion.fromLayerVersionArn(this, `Layer${i}`, arn),
      ),
      tracing: lambdaTracingConfig(props.tracingMode),
      logGroup: this.logGroup,
      filesystem,
      currentVersionOptions: props.publish ? {} : undefined,
    });

    // Publish a version if requested
    if (props.publish) {
      this.fn.currentVersion;
    }

    // Apply VPC config via CfnFunction escape hatch
    if (props.vpcConfig) {
      const cfnFn = this.fn.node.defaultChild as lambda.CfnFunction;
      cfnFn.vpcConfig = {
        securityGroupIds: props.vpcConfig.securityGroupIds,
        subnetIds: props.vpcConfig.subnetIds,
      };
    }

    Object.entries(contextTags(props.context)).forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}
