import { Construct } from 'constructs';
import { CfnResource, Tags } from 'aws-cdk-lib';
import {
  aws_kms as kms,
  aws_secretsmanager as sm,
  aws_sns as sns,
} from 'aws-cdk-lib';
import { contextId, contextTags, isEnabled } from '@sevenpico/cdk-context';
import {
  secretContext,
  kmsKeyContext,
  secretKmsKeyProps,
  smSecretProps,
  secretReadPolicyStatements,
  snsPublishPolicyStatement,
  snsSubscribePolicyStatement,
} from './secret-fns';
import { SecretProps } from './secret-types';

export class Secret extends Construct {
  public readonly secret?: sm.Secret;
  public readonly kmsKey?: kms.Key;
  public readonly kmsAlias?: kms.Alias;
  public readonly snsTopic?: sns.Topic;

  constructor(scope: Construct, id: string, props: SecretProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    const sCtx = secretContext(props.context, props);
    const kCtx = kmsKeyContext(props.context, props);

    // KMS key
    let encryptionKey: kms.IKey | undefined;
    if (props.createKmsKey !== false) {
      this.kmsKey = new kms.Key(this, 'Key', secretKmsKeyProps(kCtx, props));

      // Apply multiRegion via CfnKey escape hatch (not available on L2 KeyProps in all CDK versions)
      if (props.kmsKeyMultiRegion) {
        const cfnKey = this.kmsKey.node.defaultChild as kms.CfnKey;
        cfnKey.multiRegion = true;
      }

      this.kmsAlias = new kms.Alias(this, 'KeyAlias', {
        aliasName: `alias/${contextId(kCtx)}`,
        targetKey: this.kmsKey,
      });
      encryptionKey = this.kmsKey;
    } else if (props.kmsKeyArn) {
      encryptionKey = kms.Key.fromKeyArn(this, 'ExternalKey', props.kmsKeyArn);
    }

    // Secret
    this.secret = new sm.Secret(this, 'Secret', smSecretProps(sCtx, props, encryptionKey));

    // Ignore changes to secret value after initial creation
    if (props.secretIgnoreChanges) {
      const cfnSecret = this.secret.node.defaultChild as CfnResource;
      cfnSecret.cfnOptions.metadata = {
        ...cfnSecret.cfnOptions.metadata,
        'aws:cdk:ignore-secret-value': true,
      };
    }

    // Resource policy: read principals
    if (props.secretReadPrincipals?.length) {
      secretReadPolicyStatements(
        this.secret.secretArn,
        this.kmsKey?.keyArn,
        props.secretReadPrincipals,
      ).forEach(stmt => this.secret!.addToResourcePolicy(stmt));
    }

    // SNS topic for notifications
    if (props.createSns) {
      this.snsTopic = new sns.Topic(this, 'Topic', {
        topicName: `${contextId(sCtx)}-updates`,
        masterKey: encryptionKey,
      });

      // SNS publish principals
      if (props.snsPubPrincipals?.length) {
        const pubStmt = snsPublishPolicyStatement(this.snsTopic.topicArn, props.snsPubPrincipals);
        if (pubStmt) {
          this.snsTopic.addToResourcePolicy(pubStmt);
        }
      }

      // SNS subscribe principals
      if (props.snsSubPrincipals?.length) {
        const subStmt = snsSubscribePolicyStatement(this.snsTopic.topicArn, props.snsSubPrincipals);
        if (subStmt) {
          this.snsTopic.addToResourcePolicy(subStmt);
        }
      }
    }

    Object.entries(contextTags(props.context)).forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}
