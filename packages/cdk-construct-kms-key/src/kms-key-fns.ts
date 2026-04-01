import { RemovalPolicy } from 'aws-cdk-lib';
import { aws_kms as kms, aws_iam as iam } from 'aws-cdk-lib';
import { Context, contextId } from '@sevenpico/cdk-context';
import { KmsKeyProps } from './kms-key';

export const kmsKeyProps = (ctx: Context, props: KmsKeyProps): kms.KeyProps => ({
  description: props.description ?? contextId(ctx),
  enableKeyRotation: props.enableKeyRotation ?? true,
  policy: props.policy
    ? iam.PolicyDocument.fromJson(JSON.parse(props.policy))
    : undefined,
  keyUsage: (props.keyUsage as kms.KeyUsage) ?? kms.KeyUsage.ENCRYPT_DECRYPT,
  keySpec: (props.keySpec as kms.KeySpec) ?? kms.KeySpec.SYMMETRIC_DEFAULT,
  removalPolicy: RemovalPolicy.RETAIN,
});

export const kmsAliasName = (ctx: Context, props: KmsKeyProps): string =>
  props.alias ?? `alias/${contextId(ctx)}`;
