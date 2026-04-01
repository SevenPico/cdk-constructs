import { Context } from '@sevenpico/cdk-context';

export interface IamAssumeRoleCondition {
  readonly test: string;
  readonly variable: string;
  readonly values: string[];
}

export interface IamRoleProps {
  readonly context: Context;

  /** Description of the IAM role. Required. */
  readonly roleDescription: string;

  /**
   * Map of principal type to list of identifiers for the trust policy.
   * Key: principal type ('Service', 'AWS', 'Federated')
   * Value: list of identifiers
   * Example: { Service: ['lambda.amazonaws.com'] }
   */
  readonly principals?: Record<string, string[]>;

  /** Custom assume role policy document JSON. Overrides principals if provided. */
  readonly assumeRolePolicyDocumentOverride?: string;

  /** List of IAM policy document JSON strings to merge into the role policy */
  readonly policyDocuments?: string[];

  /** Description of the inline policy created from policyDocuments */
  readonly policyDescription?: string;

  /** Set of managed policy ARNs to attach to the role */
  readonly managedPolicyArns?: string[];

  /** Maximum session duration in seconds. Default: 3600 */
  readonly maxSessionDuration?: number;

  /** ARN of permissions boundary policy */
  readonly permissionsBoundary?: string;

  /** IAM path. Default: '/' */
  readonly path?: string;

  /** If true, use full context ID as role name. If false, use context.name. Default: true */
  readonly useFullname?: boolean;

  /** Actions allowed in the assume role policy. Default: ['sts:AssumeRole', 'sts:TagSession'] */
  readonly assumeRoleActions?: string[];

  /** Conditions for the assume role policy */
  readonly assumeRoleConditions?: IamAssumeRoleCondition[];

  /** Create an EC2 instance profile for this role. Default: false */
  readonly instanceProfileEnabled?: boolean;

  /**
   * Map of inline policy name to JSON policy document string.
   * Allows multiple named inline policies.
   */
  readonly inlinePolicies?: Record<string, string>;

  /** Whether to include tags on IAM roles and policies. Default: true */
  readonly tagsEnabled?: boolean;
}
