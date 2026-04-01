import { aws_iam as iam } from 'aws-cdk-lib';
import { Context, contextId } from '@sevenpico/cdk-context';
import { IamRoleProps, IamAssumeRoleCondition } from './iam-role-types';

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

export const buildTrustPolicyJson = (props: IamRoleProps): Record<string, unknown> => {
  if (props.assumeRolePolicyDocumentOverride) {
    return JSON.parse(props.assumeRolePolicyDocumentOverride);
  }

  const principals: Record<string, string[]> = {};
  for (const [type, ids] of Object.entries(props.principals ?? {})) {
    principals[type] = ids;
  }

  const statement: Record<string, unknown> = {
    Effect: 'Allow',
    Action: props.assumeRoleActions ?? ['sts:AssumeRole', 'sts:TagSession'],
    Principal: Object.keys(principals).length > 0 ? principals : { AWS: '*' },
  };

  if (props.assumeRoleConditions?.length) {
    const condition: Record<string, Record<string, string[]>> = {};
    props.assumeRoleConditions.forEach((c: IamAssumeRoleCondition) => {
      if (!condition[c.test]) condition[c.test] = {};
      condition[c.test][c.variable] = c.values;
    });
    statement.Condition = condition;
  }

  return {
    Version: '2012-10-17',
    Statement: [statement],
  };
};
