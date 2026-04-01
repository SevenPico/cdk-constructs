import { Construct } from 'constructs';
import { Tags, Duration } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';
import { contextId, contextTags, isEnabled } from '@sevenpico/cdk-context';
import { IamRoleProps } from './iam-role-types';
import { roleName, buildTrustPolicyJson } from './iam-role-fns';

export class IamRole extends Construct {
  public readonly role?: iam.Role;
  public readonly instanceProfile?: iam.CfnInstanceProfile;

  constructor(scope: Construct, id: string, props: IamRoleProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    this.role = new iam.Role(this, 'Role', {
      roleName: roleName(props.context, props),
      description: props.roleDescription,
      assumedBy: new iam.AccountRootPrincipal(), // placeholder, replaced below
      maxSessionDuration: Duration.seconds(props.maxSessionDuration ?? 3600),
      permissionsBoundary: props.permissionsBoundary
        ? iam.ManagedPolicy.fromManagedPolicyArn(this, 'Boundary', props.permissionsBoundary)
        : undefined,
      path: props.path ?? '/',
    });

    // Replace placeholder trust policy with the full trust document
    const cfnRole = this.role.node.defaultChild as iam.CfnRole;
    cfnRole.assumeRolePolicyDocument = buildTrustPolicyJson(props);

    // Attach managed policies
    (props.managedPolicyArns ?? []).forEach((arn, i) =>
      this.role!.addManagedPolicy(iam.ManagedPolicy.fromManagedPolicyArn(this, `Managed${i}`, arn)),
    );

    // Merge policyDocuments into a single inline policy
    if (props.policyDocuments?.length) {
      const allStatements: unknown[] = [];
      props.policyDocuments.forEach(doc => {
        const parsed = JSON.parse(doc);
        const stmts: unknown[] = parsed.Statement ?? [];
        allStatements.push(...stmts);
      });
      if (allStatements.length > 0) {
        const merged = new iam.PolicyDocument();
        allStatements.forEach(s => merged.addStatements(iam.PolicyStatement.fromJson(s)));
        this.role.attachInlinePolicy(new iam.Policy(this, 'Policy', {
          document: merged,
          policyName: `${contextId(props.context)}-policy`,
        }));
      }
    }

    // Named inline policies
    Object.entries(props.inlinePolicies ?? {}).forEach(([name, doc]) => {
      this.role!.attachInlinePolicy(new iam.Policy(this, `InlinePolicy-${name}`, {
        document: iam.PolicyDocument.fromJson(JSON.parse(doc)),
        policyName: name,
      }));
    });

    // EC2 instance profile
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
