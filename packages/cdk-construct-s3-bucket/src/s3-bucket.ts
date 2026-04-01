import { Construct } from 'constructs';
import { Tags, aws_s3 as s3, aws_kms as kms, aws_iam as iam } from 'aws-cdk-lib';
import { contextTags, isEnabled } from '@sevenpico/cdk-context';
import { S3BucketProps } from './s3-bucket-types';
import { s3BucketProps } from './s3-bucket-fns';

export class S3Bucket extends Construct {
  public readonly bucket?: s3.Bucket;

  constructor(scope: Construct, id: string, props: S3BucketProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    const encryptionKey = props.kmsKeyArn
      ? kms.Key.fromKeyArn(this, 'EncryptionKey', props.kmsKeyArn)
      : undefined;

    this.bucket = new s3.Bucket(this, 'Bucket', {
      ...s3BucketProps(props.context, props),
      encryptionKey,
      serverAccessLogsBucket: props.loggingBucketName
        ? s3.Bucket.fromBucketName(this, 'LogBucket', props.loggingBucketName)
        : undefined,
    });

    // MFA delete via CfnBucket escape hatch (not exposed on L2)
    if (props.mfaDeleteEnabled) {
      const cfnBucket = this.bucket.node.defaultChild as s3.CfnBucket;
      cfnBucket.addPropertyOverride('VersioningConfiguration', {
        Status: 'Enabled',
        MfaDelete: 'Enabled',
      });
    }

    if (props.allowSslRequestsOnly) {
      this.bucket.addToResourcePolicy(new iam.PolicyStatement({
        sid: 'AllowSSLRequestsOnly',
        effect: iam.Effect.DENY,
        principals: [new iam.AnyPrincipal()],
        actions: ['s3:*'],
        resources: [this.bucket.bucketArn, `${this.bucket.bucketArn}/*`],
        conditions: {
          Bool: { 'aws:SecureTransport': 'false' },
        },
      }));
    }

    if (props.allowEncryptedUploadsOnly) {
      this.bucket.addToResourcePolicy(new iam.PolicyStatement({
        sid: 'DenyUnEncryptedObjectUploads',
        effect: iam.Effect.DENY,
        principals: [new iam.AnyPrincipal()],
        actions: ['s3:PutObject'],
        resources: [`${this.bucket.bucketArn}/*`],
        conditions: {
          StringNotEquals: { 's3:x-amz-server-side-encryption': 'aws:kms' },
        },
      }));
    }

    (props.sourcePolicyDocuments ?? []).forEach(doc => {
      const parsed = JSON.parse(doc);
      const stmts: unknown[] = parsed.Statement ?? [];
      stmts.forEach(stmt => {
        this.bucket!.addToResourcePolicy(iam.PolicyStatement.fromJson(stmt));
      });
    });

    if (props.replicationRules?.length && props.replicationRoleArn) {
      const cfnBucket = this.bucket.node.defaultChild as s3.CfnBucket;
      cfnBucket.replicationConfiguration = {
        role: props.replicationRoleArn,
        rules: props.replicationRules.map((r, i) => ({
          id: `ReplicationRule${i}`,
          status: r.status ?? 'Enabled',
          prefix: r.prefix ?? '',
          destination: {
            bucket: r.destinationBucketArn,
            storageClass: r.destinationStorageClass,
          },
        })),
      };
    }

    Object.entries(contextTags(props.context)).forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}
