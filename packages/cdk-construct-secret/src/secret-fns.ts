import { Context, contextId, extendContext } from '@sevenpico/cdk-context';
import { Duration, RemovalPolicy, SecretValue, aws_kms as kms, aws_secretsmanager as sm, aws_iam as iam } from 'aws-cdk-lib';
import { SecretProps, SecretReadPrincipal } from './secret-types';

/** Compute the context for the secret resource, optionally overriding attributes. */
export const secretContext = (ctx: Context, props: SecretProps): Context =>
  props.secretAttributesOverride
    ? extendContext(ctx, { attributes: props.secretAttributesOverride })
    : extendContext(ctx, { attributes: ['secret'] });

/** Compute the context for the KMS key resource. */
export const kmsKeyContext = (ctx: Context, props: SecretProps): Context =>
  props.kmsKeyAttributesOverride
    ? extendContext(ctx, { attributes: props.kmsKeyAttributesOverride })
    : extendContext(ctx, { attributes: ['key'] });

/** Build KMS key props. */
export const secretKmsKeyProps = (ctx: Context, props: SecretProps): kms.KeyProps => ({
  description: `KMS key for secret ${contextId(ctx)}`,
  enableKeyRotation: props.kmsKeyEnableKeyRotation ?? true,
  pendingWindow: Duration.days(props.kmsKeyDeletionWindowInDays ?? 30),
  removalPolicy: RemovalPolicy.RETAIN,
});

/** Build SecretsManager secret props. */
export const smSecretProps = (
  ctx: Context,
  props: SecretProps,
  encryptionKey?: kms.IKey,
): sm.SecretProps => ({
  secretName: contextId(ctx),
  description: props.description,
  encryptionKey,
  replicaRegions: (props.replicaRegions ?? []).map(region => ({ region })),
  removalPolicy: RemovalPolicy.RETAIN,
  secretStringValue: props.secretString
    ? SecretValue.unsafePlainText(props.secretString)
    : undefined,
});

/** Map a SecretReadPrincipal to an IAM principal. Internal use only. */
const mapPrincipal = (p: SecretReadPrincipal): iam.IPrincipal => {
  switch (p.type) {
    case 'Service':
      return new iam.ServicePrincipal(p.identifiers[0]);
    case 'Federated':
      return new iam.FederatedPrincipal(p.identifiers[0], {});
    case 'AWS':
    default:
      if (p.identifiers.length === 1) {
        return new iam.ArnPrincipal(p.identifiers[0]);
      }
      return new iam.CompositePrincipal(
        ...p.identifiers.map(id => new iam.ArnPrincipal(id)),
      );
  }
};

/** Build conditions map from principal conditions for IAM policy statements. */
const buildConditions = (principals: SecretReadPrincipal[]): Record<string, Record<string, string[]>> => {
  const conditions: Record<string, Record<string, string[]>> = {};
  for (const p of principals) {
    for (const c of p.conditions ?? []) {
      if (!conditions[c.test]) {
        conditions[c.test] = {};
      }
      conditions[c.test][c.variable] = c.values;
    }
  }
  return conditions;
};

/** Build IAM policy statements granting read access to the secret. */
export const secretReadPolicyStatements = (
  secretArn: string,
  kmsKeyArn: string | undefined,
  principals: SecretReadPrincipal[],
): iam.PolicyStatement[] => {
  if (principals.length === 0) return [];

  const iamPrincipals = principals.map(mapPrincipal);
  const conditions = buildConditions(principals);
  const hasConditions = Object.keys(conditions).length > 0;

  const statements: iam.PolicyStatement[] = [
    new iam.PolicyStatement({
      actions: ['secretsmanager:GetSecretValue', 'secretsmanager:DescribeSecret'],
      resources: [secretArn],
      principals: iamPrincipals,
      conditions: hasConditions ? conditions : undefined,
    }),
  ];

  if (kmsKeyArn) {
    statements.push(
      new iam.PolicyStatement({
        actions: ['kms:Decrypt', 'kms:DescribeKey'],
        resources: [kmsKeyArn],
        principals: iamPrincipals,
      }),
    );
  }

  return statements;
};

/** Build IAM policy statement granting SNS publish access. */
export const snsPublishPolicyStatement = (
  topicArn: string,
  principals: SecretReadPrincipal[],
): iam.PolicyStatement | undefined => {
  if (principals.length === 0) return undefined;
  return new iam.PolicyStatement({
    actions: ['sns:Publish'],
    resources: [topicArn],
    principals: principals.map(mapPrincipal),
  });
};

/** Build IAM policy statement granting SNS subscribe access. */
export const snsSubscribePolicyStatement = (
  topicArn: string,
  principals: SecretReadPrincipal[],
): iam.PolicyStatement | undefined => {
  if (principals.length === 0) return undefined;
  return new iam.PolicyStatement({
    actions: ['sns:Subscribe'],
    resources: [topicArn],
    principals: principals.map(mapPrincipal),
  });
};
