import { makeContext } from '@sevenpico/cdk-context';
import { dynamodbProps } from '../src/dynamodb-fns';

describe('Dynamodb pure functions', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'test', name: 'test' });

  test('stub test', () => {
    expect(dynamodbProps(ctx, {})).toBeDefined();
  });
});
