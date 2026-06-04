import { makeContext } from '@sevenpico/cdk-context';
import { aws_dynamodb as dynamodb } from 'aws-cdk-lib';
import {
  mapAttrType, mapBillingMode, mapStreamViewType, mapTableClass,
  mapProjectionType, tableProps,
} from '../src/dynamodb-fns';
import { DynamodbProps } from '../src/dynamodb-types';

const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'orders' });

const baseProps: DynamodbProps = {
  context: ctx,
  hashKey: 'id',
};

describe('mapAttrType', () => {
  test('maps S to STRING', () => {
    expect(mapAttrType('S')).toBe(dynamodb.AttributeType.STRING);
  });

  test('maps N to NUMBER', () => {
    expect(mapAttrType('N')).toBe(dynamodb.AttributeType.NUMBER);
  });

  test('maps B to BINARY', () => {
    expect(mapAttrType('B')).toBe(dynamodb.AttributeType.BINARY);
  });

  test('defaults to STRING for unknown', () => {
    expect(mapAttrType('X')).toBe(dynamodb.AttributeType.STRING);
  });
});

describe('mapBillingMode', () => {
  test('defaults to PROVISIONED', () => {
    expect(mapBillingMode()).toBe(dynamodb.BillingMode.PROVISIONED);
  });

  test('maps PAY_PER_REQUEST', () => {
    expect(mapBillingMode('PAY_PER_REQUEST')).toBe(dynamodb.BillingMode.PAY_PER_REQUEST);
  });

  test('maps PROVISIONED explicitly', () => {
    expect(mapBillingMode('PROVISIONED')).toBe(dynamodb.BillingMode.PROVISIONED);
  });
});

describe('mapStreamViewType', () => {
  test('returns undefined when no value', () => {
    expect(mapStreamViewType()).toBeUndefined();
  });

  test('maps NEW_IMAGE', () => {
    expect(mapStreamViewType('NEW_IMAGE')).toBe(dynamodb.StreamViewType.NEW_IMAGE);
  });

  test('maps NEW_AND_OLD_IMAGES', () => {
    expect(mapStreamViewType('NEW_AND_OLD_IMAGES')).toBe(dynamodb.StreamViewType.NEW_AND_OLD_IMAGES);
  });

  test('returns undefined for unknown', () => {
    expect(mapStreamViewType('INVALID')).toBeUndefined();
  });
});

describe('mapTableClass', () => {
  test('defaults to STANDARD', () => {
    expect(mapTableClass()).toBe(dynamodb.TableClass.STANDARD);
  });

  test('maps STANDARD_INFREQUENT_ACCESS', () => {
    expect(mapTableClass('STANDARD_INFREQUENT_ACCESS')).toBe(dynamodb.TableClass.STANDARD_INFREQUENT_ACCESS);
  });
});

describe('mapProjectionType', () => {
  test('maps ALL', () => {
    expect(mapProjectionType('ALL')).toBe(dynamodb.ProjectionType.ALL);
  });

  test('maps KEYS_ONLY', () => {
    expect(mapProjectionType('KEYS_ONLY')).toBe(dynamodb.ProjectionType.KEYS_ONLY);
  });

  test('maps INCLUDE', () => {
    expect(mapProjectionType('INCLUDE')).toBe(dynamodb.ProjectionType.INCLUDE);
  });

  test('defaults to ALL for unknown', () => {
    expect(mapProjectionType('INVALID')).toBe(dynamodb.ProjectionType.ALL);
  });
});

describe('tableProps', () => {
  test('uses context ID as table name', () => {
    expect(tableProps(ctx, baseProps).tableName).toBe('7p-prod-orders');
  });

  test('sets partition key from hashKey', () => {
    const result = tableProps(ctx, baseProps);
    expect(result.partitionKey).toEqual({ name: 'id', type: dynamodb.AttributeType.STRING });
  });

  test('sort key is undefined when no rangeKey', () => {
    expect(tableProps(ctx, baseProps).sortKey).toBeUndefined();
  });

  test('sets sort key when rangeKey provided', () => {
    const result = tableProps(ctx, { ...baseProps, rangeKey: 'sk', rangeKeyType: 'N' });
    expect(result.sortKey).toEqual({ name: 'sk', type: dynamodb.AttributeType.NUMBER });
  });

  test('defaults to PROVISIONED billing with 5 read/write', () => {
    const result = tableProps(ctx, baseProps);
    expect(result.billingMode).toBe(dynamodb.BillingMode.PROVISIONED);
    expect(result.readCapacity).toBe(5);
    expect(result.writeCapacity).toBe(5);
  });

  test('PAY_PER_REQUEST has no capacity', () => {
    const result = tableProps(ctx, { ...baseProps, billingMode: 'PAY_PER_REQUEST' });
    expect(result.billingMode).toBe(dynamodb.BillingMode.PAY_PER_REQUEST);
    expect(result.readCapacity).toBeUndefined();
    expect(result.writeCapacity).toBeUndefined();
  });

  test('defaults to AWS_MANAGED encryption', () => {
    expect(tableProps(ctx, baseProps).encryption).toBe(dynamodb.TableEncryption.AWS_MANAGED);
  });

  test('uses CUSTOMER_MANAGED when kmsKeyArn provided', () => {
    const result = tableProps(ctx, { ...baseProps, kmsKeyArn: 'arn:aws:kms:us-east-1:123:key/abc' });
    expect(result.encryption).toBe(dynamodb.TableEncryption.CUSTOMER_MANAGED);
  });

  test('uses DEFAULT encryption when enableEncryption is false', () => {
    const result = tableProps(ctx, { ...baseProps, enableEncryption: false });
    expect(result.encryption).toBe(dynamodb.TableEncryption.DEFAULT);
  });

  test('point-in-time recovery enabled by default', () => {
    expect(tableProps(ctx, baseProps).pointInTimeRecoverySpecification).toEqual({
      pointInTimeRecoveryEnabled: true,
      recoveryPeriodInDays: undefined,
    });
  });

  test('TTL defaults to Expires attribute', () => {
    expect(tableProps(ctx, baseProps).timeToLiveAttribute).toBe('Expires');
  });

  test('TTL disabled when ttlEnabled is false', () => {
    expect(tableProps(ctx, { ...baseProps, ttlEnabled: false }).timeToLiveAttribute).toBeUndefined();
  });

  test('stream is undefined when not enabled', () => {
    expect(tableProps(ctx, baseProps).stream).toBeUndefined();
  });

  test('stream view type set when streams enabled', () => {
    const result = tableProps(ctx, { ...baseProps, enableStreams: true, streamViewType: 'NEW_IMAGE' });
    expect(result.stream).toBe(dynamodb.StreamViewType.NEW_IMAGE);
  });

  test('table class defaults to STANDARD', () => {
    expect(tableProps(ctx, baseProps).tableClass).toBe(dynamodb.TableClass.STANDARD);
  });
});
