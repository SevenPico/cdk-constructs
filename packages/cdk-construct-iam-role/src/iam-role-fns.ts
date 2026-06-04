import { Context, contextId } from '@sevenpico/cdk-context';
import { aws_iam as iam } from 'aws-cdk-lib';
import { IamRoleProps } from './iam-role-types';

export const roleName = (ctx: Context, props: IamRoleProps): string =>
  (props.useFullname ?? true) ? contextId(ctx) : ctx.name;

export const buildIamPrincipal = (type: string, identifier: string): iam.IPrincipal => {
  switch (type) {
    case 'Service': return new iam.ServicePrincipal(identifier);
    case 'AWS': return new iam.ArnPrincipal(identifier);
    case 'Federated': return new iam.FederatedPrincipal(identifier, {});
    default: return new iam.ArnPrincipal(identifier);
  }
};

export const buildTrustPolicy = (props: IamRoleProps): iam.PolicyDocument => {
  if (props.assumeRolePolicyDocumentOverride) {
    return iam.PolicyDocument.fromJson(JSON.parse(props.assumeRolePolicyDocumentOverride));
  }

  const principals = Object.entries(props.principals ?? {}).flatMap(([type, ids]) =>
    ids.map(id => buildIamPrincipal(type, id)),
  );

  const statement = new iam.PolicyStatement({
    actions: props.assumeRoleActions ?? ['sts:AssumeRole', 'sts:TagSession'],
    principals: principals.length > 0 ? principals : [new iam.AccountRootPrincipal()],
  });

  (props.assumeRoleConditions ?? []).forEach(c =>
    statement.addCondition(c.test, { [c.variable]: c.values }),
  );

  return new iam.PolicyDocument({ statements: [statement] });
};

export const mergePolicyDocuments = (docs: string[]): iam.PolicyDocument | undefined => {
  if (!docs || docs.length === 0) return undefined;
  const allStatements: iam.PolicyStatement[] = [];
  for (const doc of docs) {
    const parsed = JSON.parse(doc);
    const stmts: unknown[] = parsed.Statement ?? [];
    stmts.forEach(stmt => {
      allStatements.push(iam.PolicyStatement.fromJson(stmt));
    });
  }
  return new iam.PolicyDocument({ statements: allStatements });
};

