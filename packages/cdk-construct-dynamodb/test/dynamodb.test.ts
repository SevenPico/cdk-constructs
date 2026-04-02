import { App, Stack } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { makeContext } from '@sevenpico/cdk-context';
import { Dynamodb } from '../src/dynamodb';
import { DynamodbProps } from '../src/dynamodb-types';

const context = makeContext({ namespace: '7p', stage: 'prod', name: 'orders' });

const baseProps: DynamodbProps = {
  context,
  hashKey: 'id',
};

const synthTemplate = (props: DynamodbProps): Template => {
  const app = new App();
  const stack = new Stack(app, 'TestStack');
  new Dynamodb(stack, 'SUT', props);
  return Template.fromStack(stack);
};

describe('Dynamodb construct', () => {
  describe('Table Naming', () => {
    test('table uses context ID as name', () => {
      const template = synthTemplate(baseProps);
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: '7p-prod-orders',
      });
    });
  });

  describe('Billing Mode', () => {
    test('provisioned billing with 5 read/write capacity by default', () => {
      const template = synthTemplate(baseProps);
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        BillingMode: Match.absent(),
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      });
    });

    test('PAY_PER_REQUEST mode has no capacity units', () => {
      const template = synthTemplate({ ...baseProps, billingMode: 'PAY_PER_REQUEST' });
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        BillingMode: 'PAY_PER_REQUEST',
        ProvisionedThroughput: Match.absent(),
      });
    });
  });

  describe('Default Settings', () => {
    test('point-in-time recovery enabled by default', () => {
      const template = synthTemplate(baseProps);
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        PointInTimeRecoverySpecification: { PointInTimeRecoveryEnabled: true },
      });
    });

    test('TTL enabled with Expires attribute by default', () => {
      const template = synthTemplate(baseProps);
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        TimeToLiveSpecification: {
          AttributeName: 'Expires',
          Enabled: true,
        },
      });
    });

    test('encryption enabled by default (AWS managed)', () => {
      const template = synthTemplate(baseProps);
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        SSESpecification: { SSEEnabled: true },
      });
    });
  });

  describe('Key Schema', () => {
    test('partition key is set', () => {
      const template = synthTemplate(baseProps);
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        KeySchema: Match.arrayWith([
          { AttributeName: 'id', KeyType: 'HASH' },
        ]),
      });
    });

    test('sort key is set when rangeKey provided', () => {
      const template = synthTemplate({ ...baseProps, rangeKey: 'sk' });
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        KeySchema: Match.arrayWith([
          { AttributeName: 'sk', KeyType: 'RANGE' },
        ]),
      });
    });
  });

  describe('Secondary Indexes', () => {
    test('GSI added to table when globalSecondaryIndexes provided', () => {
      const template = synthTemplate({
        ...baseProps,
        globalSecondaryIndexes: [{
          name: 'gsi-email',
          hashKey: 'email',
          projectionType: 'ALL',
          readCapacity: 5,
          writeCapacity: 5,
        }],
      });
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        GlobalSecondaryIndexes: Match.arrayWith([
          Match.objectLike({
            IndexName: 'gsi-email',
            KeySchema: Match.arrayWith([
              { AttributeName: 'email', KeyType: 'HASH' },
            ]),
            Projection: { ProjectionType: 'ALL' },
          }),
        ]),
      });
    });

    test('LSI added to table when localSecondaryIndexes provided', () => {
      const template = synthTemplate({
        ...baseProps,
        rangeKey: 'sk',
        localSecondaryIndexes: [{
          name: 'lsi-created',
          rangeKey: 'createdAt',
          projectionType: 'KEYS_ONLY',
        }],
      });
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        LocalSecondaryIndexes: Match.arrayWith([
          Match.objectLike({
            IndexName: 'lsi-created',
            KeySchema: Match.arrayWith([
              { AttributeName: 'createdAt', KeyType: 'RANGE' },
            ]),
            Projection: { ProjectionType: 'KEYS_ONLY' },
          }),
        ]),
      });
    });
  });

  describe('Streams', () => {
    test('no stream by default', () => {
      const template = synthTemplate(baseProps);
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        StreamSpecification: Match.absent(),
      });
    });

    test('stream enabled with view type', () => {
      const template = synthTemplate({
        ...baseProps,
        enableStreams: true,
        streamViewType: 'NEW_AND_OLD_IMAGES',
      });
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        StreamSpecification: { StreamViewType: 'NEW_AND_OLD_IMAGES' },
      });
    });
  });

  describe('Autoscaling', () => {
    test('autoscaling resources created when enabled', () => {
      const template = synthTemplate({
        ...baseProps,
        enableAutoscaler: true,
      });
      template.hasResourceProperties('AWS::ApplicationAutoScaling::ScalableTarget', {
        MinCapacity: 5,
        MaxCapacity: 20,
      });
    });
  });

  describe('Encryption', () => {
    test('customer managed KMS key when kmsKeyArn provided', () => {
      const template = synthTemplate({
        ...baseProps,
        kmsKeyArn: 'arn:aws:kms:us-east-1:123456789012:key/abc-123',
      });
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        SSESpecification: Match.objectLike({
          SSEEnabled: true,
          SSEType: 'KMS',
        }),
      });
    });
  });

  describe('Disabled Construct', () => {
    test('no resources created when context is disabled', () => {
      const disabledCtx = makeContext({
        namespace: '7p', stage: 'prod', name: 'orders', enabled: false,
      });
      const template = synthTemplate({ ...baseProps, context: disabledCtx });
      expect(Object.keys(template.toJSON().Resources ?? {})).toHaveLength(0);
    });
  });
});
