import { makeContext, extendContext, contextId, contextTags, isEnabled } from '../src/context-fns';

// ---------------------------------------------------------------------------
// Example scenario: minimal
// Validates that the minimal example (namespace + environment + stage) produces
// the correct ID and default tags.
// ---------------------------------------------------------------------------

describe('Example: minimal', () => {
  const ctx = makeContext({
    namespace: 'acme',
    environment: 'dev',
    stage: 'app',
  });

  test('id is namespace-environment-stage', () => {
    expect(contextId(ctx)).toBe('acme-dev-app');
  });

  test('is enabled by default', () => {
    expect(isEnabled(ctx)).toBe(true);
  });

  test('Name tag equals the computed ID', () => {
    expect(contextTags(ctx).Name).toBe('acme-dev-app');
  });

  test('label tags are present with title-case keys', () => {
    const tags = contextTags(ctx);
    expect(tags.Namespace).toBe('acme');
    expect(tags.Environment).toBe('dev');
    expect(tags.Stage).toBe('app');
  });

  test('empty labels are not included in tags', () => {
    const tags = contextTags(ctx);
    expect(Object.keys(tags)).not.toContain('Tenant');
    expect(Object.keys(tags)).not.toContain('Name_label');
  });
});

// ---------------------------------------------------------------------------
// Example scenario: comprehensive
// Validates all props that the comprehensive example exercises.
// ---------------------------------------------------------------------------

describe('Example: comprehensive', () => {
  const ctx = makeContext({
    namespace: 'acme',
    environment: 'dev',
    stage: 'app',
    name: 'api',
    tenant: 'tenant1',
    region: 'use1',
    delimiter: '-',
    labelOrder: ['namespace', 'environment', 'stage', 'name', 'attributes'],
    labelKeyCase: 'title',
    labelValueCase: 'lower',
    idLengthLimit: 32,
    attributes: ['v2'],
    tags: {
      CostCenter: 'engineering',
      Owner: 'platform-team',
    },
    additionalTagMap: {
      ManagedBy: 'cdk',
    },
    labelsAsTags: ['namespace', 'environment', 'stage', 'name'],
  });

  test('id includes all label segments', () => {
    // With idLengthLimit=32 the full id 'acme-dev-app-api-v2' (19 chars) fits
    expect(contextId(ctx)).toBe('acme-dev-app-api-v2');
  });

  test('id does not exceed length limit', () => {
    expect(contextId(ctx).length).toBeLessThanOrEqual(32);
  });

  test('is enabled', () => {
    expect(isEnabled(ctx)).toBe(true);
  });

  test('user-provided tags are present', () => {
    const tags = contextTags(ctx);
    expect(tags.CostCenter).toBe('engineering');
    expect(tags.Owner).toBe('platform-team');
  });

  test('additionalTagMap entries are present', () => {
    expect(contextTags(ctx).ManagedBy).toBe('cdk');
  });

  test('context extension appends attributes', () => {
    const child = extendContext(ctx, { attributes: ['worker'] });
    expect(contextId(child)).toContain('worker');
    expect(contextId(child)).toContain('v2');
  });

  test('extended child id starts with parent prefix', () => {
    const child = extendContext(ctx, { attributes: ['worker'] });
    expect(contextId(child)).toMatch(/^acme-dev-app-api/);
  });
});

// ---------------------------------------------------------------------------
// Example scenario: disabled
// Validates that enabled:false is sticky and propagates through extension.
// ---------------------------------------------------------------------------

describe('Example: disabled', () => {
  const ctx = makeContext({
    namespace: 'acme',
    environment: 'dev',
    stage: 'app',
    enabled: false,
  });

  test('is not enabled', () => {
    expect(isEnabled(ctx)).toBe(false);
  });

  test('id is still computed even when disabled', () => {
    expect(contextId(ctx)).toBe('acme-dev-app');
  });

  test('disabled flag is sticky through extension', () => {
    const child = extendContext(ctx, { attributes: ['worker'], enabled: true });
    expect(isEnabled(child)).toBe(false);
  });

  test('extended child id includes child attribute', () => {
    const child = extendContext(ctx, { attributes: ['worker'] });
    expect(contextId(child)).toContain('worker');
  });
});
