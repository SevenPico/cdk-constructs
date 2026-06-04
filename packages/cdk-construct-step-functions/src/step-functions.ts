import { contextId, contextTags, isEnabled } from '@sevenpico/cdk-context';
import {
  Tags,
  RemovalPolicy,
  Duration,
  aws_stepfunctions as sfn,
  aws_iam as iam,
  aws_logs as logs,
  aws_kms as kms,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  stateMachineName,
  logGroupName,
  stateMachineType,
  loggingConfig,
  buildTrustDocument,
  mergePolicyDocuments,
} from './step-functions-fns';
import { StepFunctionsProps } from './step-functions-types';

export class StepFunctions extends Construct {
  public readonly stateMachine?: sfn.StateMachine;
  public readonly role?: iam.Role;
  public readonly logGroup?: logs.LogGroup;

  constructor(scope: Construct, id: string, props: StepFunctionsProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    // Log group
    let logGroupResource: logs.ILogGroup;
    if (props.existingLogGroupArn) {
      logGroupResource = logs.LogGroup.fromLogGroupArn(this, 'LogGroup', props.existingLogGroupArn);
    } else {
      this.logGroup = new logs.LogGroup(this, 'LogGroup', {
        logGroupName: logGroupName(props.context, props),
        retention: (props.logGroupRetentionDays ?? 90) as logs.RetentionDays,
        encryptionKey: props.cloudwatchLogsKmsKeyArn
          ? kms.Key.fromKeyArn(this, 'LogKey', props.cloudwatchLogsKmsKeyArn)
          : undefined,
        removalPolicy: RemovalPolicy.DESTROY,
      });
      logGroupResource = this.logGroup;
    }

    // IAM execution role
    this.role = new iam.Role(this, 'Role', {
      roleName: (props.useFullname ?? true) ? contextId(props.context) : props.context.name,
      description: props.roleDescription,
      assumedBy: new iam.ServicePrincipal('states.amazonaws.com'),
      maxSessionDuration: Duration.seconds(props.maxSessionDuration ?? 3600),
      permissionsBoundary: props.permissionsBoundary
        ? iam.ManagedPolicy.fromManagedPolicyArn(this, 'Boundary', props.permissionsBoundary)
        : undefined,
      path: props.path ?? '/',
    });

    // Override trust policy with configured principals
    const trustPolicy = buildTrustDocument(props.principals);
    const cfnRole = this.role.node.defaultChild as iam.CfnRole;
    cfnRole.assumeRolePolicyDocument = trustPolicy.toJSON();

    // Managed policies
    (props.managedPolicyArns ?? []).forEach((arn, i) =>
      this.role!.addManagedPolicy(iam.ManagedPolicy.fromManagedPolicyArn(this, `Managed${i}`, arn)),
    );

    // Inline policies from policy documents
    const mergedDoc = mergePolicyDocuments(props.policyDocuments ?? []);
    if (mergedDoc) {
      this.role.attachInlinePolicy(new iam.Policy(this, 'Policy', { document: mergedDoc }));
    }

    // CloudWatch Logs write permission for the role
    logGroupResource.grantWrite(this.role);

    // State machine
    this.stateMachine = new sfn.StateMachine(this, 'StateMachine', {
      stateMachineName: stateMachineName(props.context, props),
      definitionBody: sfn.DefinitionBody.fromString(JSON.stringify(props.definition)),
      stateMachineType: stateMachineType(props),
      role: this.role,
      tracingEnabled: props.tracingEnabled ?? false,
      logs: loggingConfig(logGroupResource, props.loggingConfiguration),
    });

    Object.entries(contextTags(props.context)).forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}
