import { Context } from '@sevenpico/cdk-context';

export interface IamUserProps {
  readonly context: Context;

  /** IAM username. Recommendation: use email address. Required. */
  readonly userName: string;

  /** IAM path. Default: '/' */
  readonly path?: string;

  /** List of IAM group names to add this user to */
  readonly groups?: string[];

  /** ARN of permissions boundary policy */
  readonly permissionsBoundary?: string;

  /** Force destroy user even with non-managed access keys or MFA. Default: false */
  readonly forceDestroy?: boolean;

  /** Enable console login profile creation. Default: true */
  readonly loginProfileEnabled?: boolean;

  /** PGP public key or keybase username for encrypting the generated password (hint only) */
  readonly pgpKey?: string;

  /** Require password reset on first login. Default: true */
  readonly passwordResetRequired?: boolean;

  /** Length of generated password. Default: 24 */
  readonly passwordLength?: number;
}
