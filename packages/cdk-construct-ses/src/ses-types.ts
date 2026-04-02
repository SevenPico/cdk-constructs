import { Context } from '@sevenpico/cdk-context';

export interface SesProps {
  readonly context: Context;
  readonly zoneId?: string;
  readonly zoneName?: string;
  readonly verifyDomain?: boolean;
  readonly verifyDkim?: boolean;
  readonly iamPermissions?: string[];
  readonly iamAllowedResources?: string[];
  readonly sesGroupEnabled?: boolean;
  readonly sesGroupName?: string;
  readonly sesGroupPath?: string;
  readonly sesUserEnabled?: boolean;
  readonly createIamAccessKey?: boolean;
  readonly forceDestroy?: boolean;
  readonly path?: string;
  readonly inlinePolicies?: string[];
  readonly policyArns?: string[];
  readonly permissionsBoundary?: string;
}
