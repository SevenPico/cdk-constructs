import { aws_iam as iam } from 'aws-cdk-lib';
import { Context, contextId } from '@sevenpico/cdk-context';
import { IamPolicyProps, IamPolicyStatement } from './iam-policy-types';

export const buildPolicyStatement = (sid: string, stmt: IamPolicyStatement): iam.PolicyStatement => {
  const s = new iam.PolicyStatement({
    sid,
    effect: stmt.effect === 'Deny' ? iam.Effect.DENY : iam.Effect.ALLOW,
    actions: stmt.actions,
    notActions: stmt.notActions,
    resources: stmt.resources,
    notResources: stmt.notResources,
  });

  Object.entries(stmt.principals ?? {}).forEach(([type, ids]) => {
    ids.forEach(id => s.addPrincipals(buildPrincipal(type, id)));
  });

  Object.entries(stmt.notPrincipals ?? {}).forEach(([type, ids]) => {
    ids.forEach(id => s.addNotPrincipals(buildPrincipal(type, id)));
  });

  Object.entries(stmt.conditions ?? {}).forEach(([test, vars]) => {
    Object.entries(vars).forEach(([variable, values]) => {
      s.addCondition(test, { [variable]: values });
    });
  });

  return s;
};

export const buildPolicyDocument = (props: IamPolicyProps): iam.PolicyDocument => {
  const statementStatements = Object.entries(props.policyStatements ?? {})
    .map(([sid, stmt]) => buildPolicyStatement(sid, stmt));

  const sourceStatements = (props.sourcePolicyDocuments ?? [])
    .flatMap(doc => parseDocumentStatements(doc));

  const overrideStatements = (props.overridePolicyDocuments ?? [])
    .flatMap(doc => parseDocumentStatements(doc));

  const allStatements = mergeStatements(
    [...sourceStatements, ...statementStatements],
    overrideStatements,
  );

  return new iam.PolicyDocument({
    assignSids: !!(props.iamPolicyId),
    statements: allStatements,
  });
};

export const mergeStatements = (
  source: iam.PolicyStatement[],
  overrides: iam.PolicyStatement[],
): iam.PolicyStatement[] => {
  const overrideSids = new Set(overrides.map(s => s.sid).filter(Boolean));
  return [
    ...source.filter(s => !overrideSids.has(s.sid ?? '')),
    ...overrides,
  ];
};

export const managedPolicyProps = (ctx: Context, props: IamPolicyProps, doc: iam.PolicyDocument): iam.ManagedPolicyProps => ({
  managedPolicyName: contextId(ctx),
  description: props.description,
  document: doc,
});

const parseDocumentStatements = (jsonStr: string): iam.PolicyStatement[] => {
  const parsed = JSON.parse(jsonStr);
  const stmts: any[] = parsed.Statement ?? [];
  return stmts.map((s: any) => iam.PolicyStatement.fromJson(s));
};

const buildPrincipal = (type: string, id: string): iam.IPrincipal => {
  switch (type) {
    case 'Service': return new iam.ServicePrincipal(id);
    case 'AWS': return new iam.ArnPrincipal(id);
    case 'Federated': return new iam.FederatedPrincipal(id, {});
    default: return new iam.ArnPrincipal(id);
  }
};
