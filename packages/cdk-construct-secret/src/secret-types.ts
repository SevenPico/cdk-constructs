import { Context } from '@sevenpico/cdk-context';

export interface SecretPrincipalCondition {
  readonly test: string;
  readonly variable: string;
  readonly values: string[];
}

export interface SecretReadPrincipal {
  readonly type: string;
  readonly identifiers: string[];
  readonly conditions?: SecretPrincipalCondition[];
}

export interface SecretProps {
  readonly context: Context;

  /** Initial secret value. Default: empty string. Manage via console/CLI after creation. */
  readonly secretString?: string;

  /** Secret description */
  readonly description?: string;

  /** Create a dedicated KMS key for the secret. Default: true */
  readonly createKmsKey?: boolean;

  /** Existing KMS key ARN to use instead of creating one. Ignored if createKmsKey = true */
  readonly kmsKeyArn?: string;

  /** KMS key pending deletion window in days. Default: 30 */
  readonly kmsKeyDeletionWindowInDays?: number;

  /** Enable KMS key rotation. Default: true */
  readonly kmsKeyEnableKeyRotation?: boolean;

  /** If true, use multi-region KMS key. Default: false */
  readonly kmsKeyMultiRegion?: boolean;

  /** Ignore changes to the secret value after initial creation. Default: false */
  readonly secretIgnoreChanges?: boolean;

  /** Create an SNS topic for secret update notifications. Default: false */
  readonly createSns?: boolean;

  /** IAM principals allowed to read the secret */
  readonly secretReadPrincipals?: SecretReadPrincipal[];

  /** IAM principals allowed to publish to the SNS topic */
  readonly snsPubPrincipals?: SecretReadPrincipal[];

  /** IAM principals allowed to subscribe to the SNS topic */
  readonly snsSubPrincipals?: SecretReadPrincipal[];

  /** Regions to replicate the secret to */
  readonly replicaRegions?: string[];

  /** Context attributes override for the secret resource (appended to base context) */
  readonly secretAttributesOverride?: string[];

  /** Context attributes override for the KMS key resource */
  readonly kmsKeyAttributesOverride?: string[];
}
