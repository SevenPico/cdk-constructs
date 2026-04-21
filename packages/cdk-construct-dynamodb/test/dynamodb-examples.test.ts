import { makeContext } from '@sevenpico/cdk-context';
import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { Dynamodb } from '../src/dynamodb';

function makeStack(): Stack {
  const app = new App();
  return new Stack(app, 'TestStack');
}

const CONTEXT = makeContext({ namespace: 'acme', environment: 'dev', stage: 'app' });

describe('Example: minimal', () => {
  let template: Template;
  beforeAll(() => {
    const stack = makeStack();
    new Dynamodb(stack, 'Table', { context: CONTEXT, hashKey: 'id' });
    template = Template.fromStack(stack);
  });
  test('creates exactly 1 DynamoDB table', () => {
    template.resourceCountIs('AWS::DynamoDB::Table', 1);
  });
});

describe('Example: comprehensive', () => {
  let template: Template;
  beforeAll(() => {
    const stack = makeStack();
    new Dynamodb(stack, 'Table', {
      context: CONTEXT,
      hashKey: 'pk',
      rangeKey: 'sk',
      billingMode: 'PAY_PER_REQUEST',
      enableEncryption: true,
      enablePointInTimeRecovery: true,
      enableStreams: true,
      streamViewType: 'NEW_AND_OLD_IMAGES',
      ttlEnabled: true,
      ttlAttribute: 'expiresAt',
      globalSecondaryIndexes: [
        {
          name: 'gsi1',
          hashKey: 'gsi1pk',
          rangeKey: 'gsi1sk',
          projectionType: 'ALL',
        },
      ],
    });
    template = Template.fromStack(stack);
  });
  test('creates exactly 1 DynamoDB table', () => {
    template.resourceCountIs('AWS::DynamoDB::Table', 1);
  });
  test('table has streams enabled', () => {
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      StreamSpecification: { StreamViewType: 'NEW_AND_OLD_IMAGES' },
    });
  });
});

describe('Example: disabled', () => {
  let template: Template;
  beforeAll(() => {
    const stack = makeStack();
    new Dynamodb(stack, 'Table', {
      context: makeContext({ namespace: 'acme', environment: 'dev', stage: 'app', enabled: false }),
      hashKey: 'id',
    });
    template = Template.fromStack(stack);
  });
  test('creates zero DynamoDB tables when disabled', () => {
    template.resourceCountIs('AWS::DynamoDB::Table', 0);
  });
});
