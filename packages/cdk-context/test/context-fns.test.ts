import { contextId, contextTags, extendContext, isEnabled, makeContext } from '../src/context-fns';

// ---------------------------------------------------------------------------
// Feature: ID Computation
// ---------------------------------------------------------------------------

describe('Feature: ID Computation', () => {
  test('Scenario: Default context produces correct ID', () => {
    const ctx = makeContext({ namespace: '7p', environment: 'prod', name: 'queue' });
    expect(contextId(ctx)).toBe('7p-prod-queue');
  });

  test('Scenario: Empty labels are excluded from ID', () => {
    const ctx = makeContext({ namespace: '7p', name: 'queue' });
    expect(contextId(ctx)).toBe('7p-queue');
  });

  test('Scenario: Attributes are appended to ID', () => {
    const ctx = makeContext({ namespace: '7p', name: 'queue', attributes: ['dlq'] });
    expect(contextId(ctx)).toBe('7p-queue-dlq');
  });

  test('Scenario: labelValueCase lower normalizes ID', () => {
    const ctx = makeContext({ namespace: '7P', name: 'Queue', labelValueCase: 'lower' });
    expect(contextId(ctx)).toBe('7p-queue');
  });

  test('Scenario: labelValueCase none preserves original casing', () => {
    const ctx = makeContext({ namespace: '7P', name: 'Queue', labelValueCase: 'none' });
    const id = contextId(ctx);
    expect(id).toContain('7P');
    expect(id).toContain('Queue');
  });

  test('Scenario: idLengthLimit truncates with MD5 suffix', () => {
    const ctx = makeContext({ namespace: '7p', name: 'averylongresourcename', idLengthLimit: 12 });
    const id = contextId(ctx);
    expect(id.length).toBeLessThanOrEqual(12);
    // ends with a 5-character hash suffix preceded by '-'
    expect(id).toMatch(/-[a-f0-9]{5}$/);
  });

  test('Scenario: regexReplaceChars strips special characters', () => {
    const ctx = makeContext({ name: 'my_resource.name' });
    const id = contextId(ctx);
    expect(id).not.toContain('_');
    expect(id).not.toContain('.');
  });
});

// ---------------------------------------------------------------------------
// Feature: extendContext
// ---------------------------------------------------------------------------

describe('Feature: extendContext', () => {
  test('Scenario: Attributes are appended not replaced', () => {
    const base = makeContext({ namespace: '7p', name: 'queue', attributes: ['api'] });
    const result = extendContext(base, { attributes: ['v2'] });
    expect(result.attributes).toEqual(['api', 'v2']);
    expect(contextId(result)).toMatch(/api-v2$/);
  });

  test('Scenario: enabled false is sticky', () => {
    const base = makeContext({ enabled: false });
    const result = extendContext(base, { enabled: true });
    expect(result.enabled).toBe(false);
  });

  test('Scenario: String label override replaces base', () => {
    const base = makeContext({ name: 'old' });
    const result = extendContext(base, { name: 'new' });
    expect(contextId(result)).toContain('new');
    expect(contextId(result)).not.toContain('old');
  });

  test('Scenario: Empty string override does not replace base', () => {
    const base = makeContext({ name: 'original' });
    const result = extendContext(base, { name: '' });
    expect(contextId(result)).toContain('original');
  });
});

// ---------------------------------------------------------------------------
// Feature: Tag Computation
// ---------------------------------------------------------------------------

describe('Feature: Tag Computation', () => {
  test('Scenario: Name tag equals context ID', () => {
    const ctx = makeContext({ namespace: '7p', name: 'queue' });
    expect(contextTags(ctx)).toMatchObject({ Name: '7p-queue' });
  });

  test('Scenario: labelKeyCase title capitalizes tag keys', () => {
    const ctx = makeContext({ namespace: '7p', labelKeyCase: 'title' });
    const tags = contextTags(ctx);
    expect(Object.keys(tags)).toContain('Namespace');
  });

  test('Scenario: Empty labels are excluded from tags', () => {
    const ctx = makeContext({ namespace: '7p' });
    const tags = contextTags(ctx);
    expect(Object.keys(tags)).not.toContain('Tenant');
    expect(Object.keys(tags)).not.toContain('tenant');
    expect(Object.keys(tags)).not.toContain('Environment');
    expect(Object.keys(tags)).not.toContain('environment');
  });

  test('Scenario: User-provided tags override computed tags', () => {
    const ctx = makeContext({ namespace: '7p', tags: { Name: 'override' } });
    expect(contextTags(ctx).Name).toBe('override');
  });
});

// ---------------------------------------------------------------------------
// Feature: isEnabled
// ---------------------------------------------------------------------------

describe('Feature: isEnabled', () => {
  test('Scenario: Context is enabled by default', () => {
    const ctx = makeContext({});
    expect(isEnabled(ctx)).toBe(true);
  });

  test('Scenario: Context is disabled when enabled is false', () => {
    const ctx = makeContext({ enabled: false });
    expect(isEnabled(ctx)).toBe(false);
  });
});
