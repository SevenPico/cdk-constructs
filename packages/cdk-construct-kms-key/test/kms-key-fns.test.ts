import { makeContext } from '@sevenpico/cdk-context';
import { kmsKeyProps, kmsAliasName } from '../src/kms-key-fns';

describe('kmsKeyProps', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'secrets' });

  test('description defaults to context id', () => {
    const props = kmsKeyProps(ctx, { context: ctx });
    expect(props.description).toBe('7p-prod-secrets');
  });

  test('custom description overrides default', () => {
    const props = kmsKeyProps(ctx, { context: ctx, description: 'My Key' });
    expect(props.description).toBe('My Key');
  });

  test('enableKeyRotation defaults to true', () => {
    const props = kmsKeyProps(ctx, { context: ctx });
    expect(props.enableKeyRotation).toBe(true);
  });
});

describe('kmsAliasName', () => {
  const ctx = makeContext({ namespace: '7p', stage: 'prod', name: 'secrets' });

  test('defaults to alias/{context.id}', () => {
    expect(kmsAliasName(ctx, { context: ctx })).toBe('alias/7p-prod-secrets');
  });

  test('custom alias overrides default', () => {
    expect(kmsAliasName(ctx, { context: ctx, alias: 'alias/my-key' })).toBe('alias/my-key');
  });
});
