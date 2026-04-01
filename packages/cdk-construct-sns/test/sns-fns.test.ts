import { makeContext } from '@sevenpico/cdk-context';
import { topicName, dlqContext, snsTopicProps } from '../src/sns-fns';
import { contextId } from '@sevenpico/cdk-context';

describe('topicName', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'alerts' });

  test('defaults to context id', () => {
    expect(topicName(ctx, { context: ctx })).toBe('7p-prod-alerts');
  });

  test('appends .fifo for FIFO topics', () => {
    expect(topicName(ctx, { context: ctx, fifoTopic: true })).toBe('7p-prod-alerts.fifo');
  });
});

describe('dlqContext', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'alerts' });

  test('extends context with dlq attribute', () => {
    const dCtx = dlqContext(ctx);
    expect(contextId(dCtx)).toBe('7p-prod-alerts-dlq');
  });
});

describe('snsTopicProps', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'alerts' });

  test('sets fifo to false by default', () => {
    const props = snsTopicProps(ctx, { context: ctx });
    expect(props.fifo).toBe(false);
  });

  test('sets content-based deduplication to false by default', () => {
    const props = snsTopicProps(ctx, { context: ctx });
    expect(props.contentBasedDeduplication).toBe(false);
  });
});
