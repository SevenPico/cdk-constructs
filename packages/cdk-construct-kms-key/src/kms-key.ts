import { Context, contextTags, isEnabled } from '@sevenpico/cdk-context';
import { Tags, aws_kms as kms } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { kmsKeyProps, kmsAliasName } from './kms-key-fns';

export interface KmsKeyProps {
  readonly context: Context;

  /** Description shown in the AWS console. Default: context.id */
  readonly description?: string;

  /** Alias name. Must start with 'alias/'. Default: 'alias/{context.id}' */
  readonly alias?: string;

  /** Days before key is deleted after destroy. Min 7, max 30. Default: 10 */
  readonly pendingWindowInDays?: number;

  /** Enable automatic annual key rotation. Default: true */
  readonly enableKeyRotation?: boolean;

  /** Key policy JSON document. Default: AWS-managed default policy */
  readonly policy?: string;

  /** Key usage. Default: 'ENCRYPT_DECRYPT' */
  readonly keyUsage?: string;

  /** Key spec. Default: 'SYMMETRIC_DEFAULT' */
  readonly keySpec?: string;

  /** Create a multi-region primary key. Default: false */
  readonly multiRegion?: boolean;
}

export class KmsKey extends Construct {
  public readonly key?: kms.Key;
  public readonly alias?: kms.Alias;

  constructor(scope: Construct, id: string, props: KmsKeyProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    this.key = new kms.Key(this, 'Key', kmsKeyProps(props.context, props));

    // Apply properties not available on the L2 KeyProps in CDK 2.100.0
    const cfnKey = this.key.node.defaultChild as kms.CfnKey;
    cfnKey.pendingWindowInDays = props.pendingWindowInDays ?? 10;
    if (props.multiRegion) {
      cfnKey.multiRegion = true;
    }

    this.alias = new kms.Alias(this, 'Alias', {
      aliasName: kmsAliasName(props.context, props),
      targetKey: this.key,
    });

    Object.entries(contextTags(props.context)).forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}
