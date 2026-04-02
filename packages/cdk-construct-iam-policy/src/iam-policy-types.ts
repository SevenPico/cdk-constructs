import { Context } from '@sevenpico/cdk-context';

export interface IamPolicyStatement {
  readonly sid?: string;
  readonly effect?: string;
  readonly actions?: string[];
  readonly notActions?: string[];
  readonly resources?: string[];
  readonly notResources?: string[];
  readonly principals?: Record<string, string[]>;
  readonly notPrincipals?: Record<string, string[]>;
  readonly conditions?: Record<string, Record<string, string[]>>;
}

export interface IamPolicyProps {
  readonly context: Context;

  /** Map of SID to policy statement definition */
  readonly policyStatements?: Record<string, IamPolicyStatement>;

  /** List of IAM policy document JSON strings to use as source documents */
  readonly sourcePolicyDocuments?: string[];

  /** List of IAM policy document JSON strings that override source documents when SIDs match */
  readonly overridePolicyDocuments?: string[];

  /** Policy description */
  readonly description?: string;

  /** If true, creates the IAM managed policy resource. Default: false */
  readonly iamPolicyEnabled?: boolean;

  /** Policy document ID */
  readonly iamPolicyId?: string;

  /** URL hint for fetching policy JSON externally (not used internally) */
  readonly sourceJsonUrl?: string;
}
