import { makeContext } from '@sevenpico/cdk-context';
import { sqsQueueProps } from '../src/sqs-queue-fns';

describe('SqsQueue pure functions', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'test', name: 'test' });

  test('stub test', () => {
    expect(sqsQueueProps(ctx, {})).toBeDefined();
  });
});
