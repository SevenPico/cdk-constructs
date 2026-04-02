import { aws_iam as iam } from 'aws-cdk-lib';
import { Context, contextId } from '@sevenpico/cdk-context';
import { SesProps } from './ses-types';

export const sesIdentityName = (ctx: Context): string => contextId(ctx);

export const sesGroupName = (ctx: Context, props: SesProps): string =>
  props.sesGroupName ?? `${contextId(ctx)}-ses`;

export const sesUserName = (ctx: Context): string => `${contextId(ctx)}-ses-user`;

export const sesPolicyStatement = (props: SesProps, identityArn: string): iam.PolicyStatement =>
  new iam.PolicyStatement({
    actions: props.iamPermissions ?? ['ses:SendRawEmail'],
    resources: (props.iamAllowedResources ?? []).length > 0
      ? props.iamAllowedResources!
      : [identityArn],
  });
