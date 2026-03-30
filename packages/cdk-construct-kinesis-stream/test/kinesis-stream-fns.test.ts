import { makeContext } from '@sevenpico/cdk-context';
import { kinesisStreamProps } from '../src/kinesis-stream-fns';

describe('KinesisStream pure functions', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'test', name: 'test' });

  test('stub test', () => {
    expect(kinesisStreamProps(ctx, {})).toBeDefined();
  });
});
