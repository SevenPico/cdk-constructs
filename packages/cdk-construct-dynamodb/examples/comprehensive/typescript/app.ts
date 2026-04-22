import { App, Stack } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { Dynamodb } from '@sevenpico/cdk-construct-dynamodb';

const app = new App();
const stack = new Stack(app, 'DynamodbComprehensiveStack');

const context = makeContext({
  namespace: 'acme',
  environment: 'dev',
  stage: 'app',
  tags: { Owner: 'platform-team', CostCenter: 'engineering' },
});

new Dynamodb(stack, 'Table', {
  context,
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

app.synth();
