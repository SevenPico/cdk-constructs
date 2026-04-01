import { Construct } from 'constructs';
import { Tags, Duration, aws_iam as iam } from 'aws-cdk-lib';
import { contextTags, contextId, isEnabled } from '@sevenpico/cdk-context';
import { IamRoleProps } from './iam-role-types';
import { roleName, buildTrustPolicy, mergePolicyDocuments } from './iam-role-fns';

export class IamRole extends Construct {
  public readonly role?: iam.Role;
  public readonly instanceProfile?: iam.CfnInstanceProfile;

  constructor(scope: Construct, id: string, props: IamRoleProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    const trustPolicy = buildTrustPolicy(props);

    this.role = new iam.Role(this, 'Role', {
      roleName: roleName(props.context, props),
      description: props.roleDescription,
      assumedBy: new iam.AccountRootPrincipal(),
      maxSessionDuration: Duration.seconds(props.maxSessionDuration ?? 3600),
      permissionsBoundary: props.permissionsBoundary
        ? iam.ManagedPolicy.fromManagedPolicyArn(this, 'Boundary', props.permissionsBoundary)
        : undefined,
      path: props.path ?? '/',
    });

    const cfnRole = this.role.node.defaultChild as iam.CfnRole;
    cfnRole.assumeRolePolicyDocument = trustPolicy.toJSON();

    (props.managedPolicyArns ?? []).forEach((arn, i) =>
      this.role!.addManagedPolicy(iam.ManagedPolicy.fromManagedPolicyArn(this, `Managed${i}`, arn)),
    );

    const mergedDoc = mergePolicyDocuments(props.policyDocuments ?? []);
    if (mergedDoc) {
      const inlinePolicy = new iam.Policy(this, 'Policy', {
        document: mergedDoc,
        policyName: `${contextId(props.context)}-policy`,
      });
      this.role.attachInlinePolicy(inlinePolicy);

      if (props.policyDescription) {
        const cfnPolicy = inlinePolicy.node.defaultChild as iam.CfnPolicy;
        cfnPolicy.addMetadata('Description', props.policyDescription);
      }
    }

    Object.entries(props.inlinePolicies ?? {}).forEach(([name, doc]) => {
      this.role!.attachInlinePolicy(new iam.Policy(this, `InlinePolicy-${name}`, {
        document: iam.PolicyDocument.fromJson(JSON.parse(doc)),
        policyName: name,
      }));
    });

    if (props.instanceProfileEnabled) {
      this.instanceProfile = new iam.CfnInstanceProfile(this, 'InstanceProfile', {
        roles: [this.role.roleName],
        instanceProfileName: contextId(props.context),
      });
    }

    if (props.tagsEnabled !== false) {
      Object.entries(contextTags(props.context)).forEach(([k, v]) => Tags.of(this).add(k, v));
    }
  }
}
