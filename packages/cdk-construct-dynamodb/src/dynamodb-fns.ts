import { Context, contextId } from '@sevenpico/cdk-context';
import { RemovalPolicy, aws_dynamodb as dynamodb } from 'aws-cdk-lib';
import { DynamodbProps } from './dynamodb-types';

export const mapAttrType = (t: string): dynamodb.AttributeType => {
  const map: Record<string, dynamodb.AttributeType> = {
    S: dynamodb.AttributeType.STRING,
    N: dynamodb.AttributeType.NUMBER,
    B: dynamodb.AttributeType.BINARY,
  };
  return map[t] ?? dynamodb.AttributeType.STRING;
};

export const mapBillingMode = (mode?: string): dynamodb.BillingMode =>
  mode === 'PAY_PER_REQUEST'
    ? dynamodb.BillingMode.PAY_PER_REQUEST
    : dynamodb.BillingMode.PROVISIONED;

export const mapStreamViewType = (v?: string): dynamodb.StreamViewType | undefined => {
  if (!v) return undefined;
  const map: Record<string, dynamodb.StreamViewType> = {
    NEW_IMAGE: dynamodb.StreamViewType.NEW_IMAGE,
    OLD_IMAGE: dynamodb.StreamViewType.OLD_IMAGE,
    NEW_AND_OLD_IMAGES: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    KEYS_ONLY: dynamodb.StreamViewType.KEYS_ONLY,
  };
  return map[v];
};

export const mapTableClass = (c?: string): dynamodb.TableClass =>
  c === 'STANDARD_INFREQUENT_ACCESS'
    ? dynamodb.TableClass.STANDARD_INFREQUENT_ACCESS
    : dynamodb.TableClass.STANDARD;

export const mapProjectionType = (p: string): dynamodb.ProjectionType => {
  const map: Record<string, dynamodb.ProjectionType> = {
    ALL: dynamodb.ProjectionType.ALL,
    KEYS_ONLY: dynamodb.ProjectionType.KEYS_ONLY,
    INCLUDE: dynamodb.ProjectionType.INCLUDE,
  };
  return map[p] ?? dynamodb.ProjectionType.ALL;
};

export const tableProps = (ctx: Context, props: DynamodbProps): dynamodb.TableProps => ({
  tableName: contextId(ctx),
  partitionKey: { name: props.hashKey, type: mapAttrType(props.hashKeyType ?? 'S') },
  sortKey: props.rangeKey
    ? { name: props.rangeKey, type: mapAttrType(props.rangeKeyType ?? 'S') }
    : undefined,
  billingMode: mapBillingMode(props.billingMode),
  readCapacity: mapBillingMode(props.billingMode) === dynamodb.BillingMode.PROVISIONED
    ? (props.readCapacity ?? 5) : undefined,
  writeCapacity: mapBillingMode(props.billingMode) === dynamodb.BillingMode.PROVISIONED
    ? (props.writeCapacity ?? 5) : undefined,
  encryption: props.kmsKeyArn
    ? dynamodb.TableEncryption.CUSTOMER_MANAGED
    : (props.enableEncryption !== false
      ? dynamodb.TableEncryption.AWS_MANAGED
      : dynamodb.TableEncryption.DEFAULT),
  pointInTimeRecoverySpecification: {
    pointInTimeRecoveryEnabled: props.enablePointInTimeRecovery ?? true,
    recoveryPeriodInDays: props.pointInTimeRecoveryPeriodInDays,
  },
  stream: props.enableStreams
    ? mapStreamViewType(props.streamViewType)
    : undefined,
  timeToLiveAttribute: props.ttlEnabled !== false ? (props.ttlAttribute ?? 'Expires') : undefined,
  tableClass: mapTableClass(props.tableClass),
  replicationRegions: (props.replicas ?? []).length > 0
    ? props.replicas!.map(r => r.region)
    : undefined,
  removalPolicy: RemovalPolicy.RETAIN,
});
