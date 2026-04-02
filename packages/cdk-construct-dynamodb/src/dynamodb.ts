import { Construct } from 'constructs';
import { Tags } from 'aws-cdk-lib';
import { aws_dynamodb as dynamodb, aws_kms as kms } from 'aws-cdk-lib';
import { contextTags, isEnabled } from '@sevenpico/cdk-context';
import { DynamodbProps } from './dynamodb-types';
import { tableProps, mapAttrType, mapBillingMode, mapProjectionType } from './dynamodb-fns';

export class Dynamodb extends Construct {
  public readonly table?: dynamodb.Table;

  constructor(scope: Construct, id: string, props: DynamodbProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    const encKey = props.kmsKeyArn
      ? kms.Key.fromKeyArn(this, 'Key', props.kmsKeyArn)
      : undefined;

    this.table = new dynamodb.Table(this, 'Table', {
      ...tableProps(props.context, props),
      encryptionKey: encKey,
    });

    // Global Secondary Indexes
    (props.globalSecondaryIndexes ?? []).forEach(gsi => {
      this.table!.addGlobalSecondaryIndex({
        indexName: gsi.name,
        partitionKey: { name: gsi.hashKey, type: mapAttrType('S') },
        sortKey: gsi.rangeKey
          ? { name: gsi.rangeKey, type: dynamodb.AttributeType.STRING }
          : undefined,
        projectionType: mapProjectionType(gsi.projectionType),
        nonKeyAttributes: gsi.nonKeyAttributes,
        readCapacity: gsi.readCapacity,
        writeCapacity: gsi.writeCapacity,
      });
    });

    // Local Secondary Indexes
    (props.localSecondaryIndexes ?? []).forEach(lsi => {
      this.table!.addLocalSecondaryIndex({
        indexName: lsi.name,
        sortKey: { name: lsi.rangeKey, type: dynamodb.AttributeType.STRING },
        projectionType: mapProjectionType(lsi.projectionType),
        nonKeyAttributes: lsi.nonKeyAttributes,
      });
    });

    // Autoscaling (PROVISIONED mode only)
    if (props.enableAutoscaler && mapBillingMode(props.billingMode) === dynamodb.BillingMode.PROVISIONED) {
      const readScaling = this.table.autoScaleReadCapacity({
        minCapacity: props.autoscaleReadMin ?? 5,
        maxCapacity: props.autoscaleReadMax ?? 20,
      });
      readScaling.scaleOnUtilization({ targetUtilizationPercent: props.autoscaleReadTarget ?? 50 });

      const writeScaling = this.table.autoScaleWriteCapacity({
        minCapacity: props.autoscaleWriteMin ?? 5,
        maxCapacity: props.autoscaleWriteMax ?? 20,
      });
      writeScaling.scaleOnUtilization({ targetUtilizationPercent: props.autoscaleWriteTarget ?? 50 });
    }

    Object.entries(contextTags(props.context)).forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}
