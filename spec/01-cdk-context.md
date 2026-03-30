# @sevenpico/cdk-context

> **Agent Context**: Before implementing this spec, read [`spec/AGENT-CONTEXT.md`](./AGENT-CONTEXT.md) for the full project context, functional architecture pattern, JSII constraints, and README generation requirements.

## Dependencies
None. This package has no CDK dependency and no inter-package dependencies.
**All other packages depend on this one.**

## Source
https://github.com/SevenPico/terraform-null-context

## Package
`@sevenpico/cdk-context`
Directory: `packages/cdk-context`

## Purpose
TypeScript port of the SevenPico `terraform-null-context` module. Provides the naming and tagging system used by all SevenPico CDK constructs. A `Context` object holds normalized label values and exposes a computed `id` (resource name) and `tags` map. All logic is implemented as pure functions.

---

## ContextProps Interface (JSII-exported)

Mirrors all variables in `terraform-null-context` exactly.

```typescript
export interface ContextProps {
  // Core labels — combined to compute the resource ID
  readonly namespace?: string;       // Org abbreviation, e.g. '7p'
  readonly tenant?: string;          // Customer identifier (not in default labelOrder)
  readonly environment?: string;     // Region or role, e.g. 'prod', 'uw2'
  readonly stage?: string;           // Lifecycle stage, e.g. 'api', 'data'
  readonly name?: string;            // Component name, e.g. 'queue', 'db'
  readonly region?: string;          // AWS region identifier
  readonly project?: string;         // Project identifier

  // Control
  readonly enabled?: boolean;        // Default: true. False disables resource creation.
  readonly delimiter?: string;       // Default: '-'
  readonly attributes?: string[];    // Appended to end of ID. Default: []

  // Naming configuration
  readonly labelOrder?: string[];
  // Default: ['namespace', 'environment', 'stage', 'name', 'attributes']
  // Note: 'tenant' is available but excluded from default order for backward compatibility

  readonly labelKeyCase?: string;
  // Controls tag KEY case. Values: 'lower' | 'title' | 'upper'. Default: 'title'

  readonly labelValueCase?: string;
  // Controls label/tag VALUE case. Values: 'lower' | 'title' | 'upper' | 'none'. Default: 'lower'

  readonly regexReplaceChars?: string;
  // Regex (as string) to strip invalid chars. Default: '[^-a-zA-Z0-9]'

  readonly idLengthLimit?: number;
  // Max ID length. 0 = unlimited. If exceeded, truncate + append MD5 suffix. Default: 0

  // Tags
  readonly tags?: Record<string, string>;            // Additional tags, passed through unchanged
  readonly additionalTagMap?: Record<string, string>; // Extra key-value pairs added to all tags
  readonly labelsAsTags?: string[];
  // Which labels become tags. Default: ['namespace', 'environment', 'stage', 'name', 'tenant', 'attributes']

  // Advanced
  readonly descriptorFormats?: Record<string, string>; // Custom descriptor format strings
  readonly domainName?: string;       // Route53 zone domain name
  readonly dnsNameFormat?: string;    // Default: '${name}.${domainName}'
}
```

---

## Context Type (computed, JSII-exported)

The fully-computed, normalized context. All fields are non-optional.

```typescript
export interface Context {
  // Normalized input labels
  readonly namespace: string;
  readonly tenant: string;
  readonly environment: string;
  readonly stage: string;
  readonly name: string;
  readonly region: string;
  readonly project: string;

  // Normalized control values
  readonly enabled: boolean;
  readonly delimiter: string;
  readonly attributes: string[];
  readonly labelOrder: string[];
  readonly labelKeyCase: string;
  readonly labelValueCase: string;
  readonly regexReplaceChars: string;
  readonly idLengthLimit: number;

  // Normalized tag values
  readonly tags: Record<string, string>;
  readonly additionalTagMap: Record<string, string>;
  readonly labelsAsTags: string[];

  // Advanced
  readonly descriptorFormats: Record<string, string>;
  readonly domainName: string;
  readonly dnsNameFormat: string;

  // Computed outputs
  readonly id: string;     // The resource name — join of non-empty labels in labelOrder
  readonly idFull: string; // Full ID before length limit is applied
}
```

---

## Default Values

| Field | Default |
|-------|---------|
| `namespace` | `''` |
| `tenant` | `''` |
| `environment` | `''` |
| `stage` | `''` |
| `name` | `''` |
| `region` | `''` |
| `project` | `''` |
| `enabled` | `true` |
| `delimiter` | `'-'` |
| `attributes` | `[]` |
| `labelOrder` | `['namespace', 'environment', 'stage', 'name', 'attributes']` |
| `labelKeyCase` | `'title'` |
| `labelValueCase` | `'lower'` |
| `regexReplaceChars` | `'[^-a-zA-Z0-9]'` |
| `idLengthLimit` | `0` |
| `tags` | `{}` |
| `additionalTagMap` | `{}` |
| `labelsAsTags` | `['namespace', 'environment', 'stage', 'name', 'tenant', 'attributes']` |
| `descriptorFormats` | `{}` |
| `domainName` | `''` |
| `dnsNameFormat` | `'${name}.${domainName}'` |

---

## ID Computation Algorithm

Matches `terraform-null-context` exactly.

### Step 1: Normalize each string label

Strip characters matching `regexReplaceChars`:
```typescript
const normalize = (value: string, regex: RegExp): string =>
  value.replace(regex, '');
```

### Step 2: Apply `labelValueCase` transformation
```typescript
const applyCase = (value: string, mode: string): string => {
  switch (mode) {
    case 'lower': return value.toLowerCase();
    case 'upper': return value.toUpperCase();
    case 'title': return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    case 'none':  return value;
    default:      return value.toLowerCase();
  }
};
```

### Step 3: Build label map
```typescript
const labelMap: Record<string, string> = {
  namespace:   applyCase(normalize(namespace, regex), labelValueCase),
  tenant:      applyCase(normalize(tenant, regex), labelValueCase),
  project:     applyCase(normalize(project, regex), labelValueCase),
  region:      applyCase(normalize(region, regex), labelValueCase),
  environment: applyCase(normalize(environment, regex), labelValueCase),
  stage:       applyCase(normalize(stage, regex), labelValueCase),
  name:        applyCase(normalize(name, regex), labelValueCase),
  attributes:  attributes.map(a => applyCase(normalize(a, regex), labelValueCase)).join(delimiter),
};
```

### Step 4: Select and join

```typescript
const labels = labelOrder
  .map(key => labelMap[key])
  .filter(v => v && v.length > 0);

const idFull = labels.join(delimiter);
```

### Step 5: Apply `idLengthLimit`

```typescript
const applyLengthLimit = (idFull: string, limit: number): string => {
  if (limit === 0 || idFull.length <= limit) return idFull;
  const hash = md5(idFull).slice(0, 5); // first 5 chars of MD5 hex digest
  const truncated = idFull.slice(0, limit - 6); // leave room for '-' + 5 hash chars
  return `${truncated}-${hash}`;
};
```

Use the `md5` npm package or a pure implementation. No external dependencies are preferred — implement MD5 inline or use Node.js `crypto.createHash('md5')`.

---

## Tag Computation

```typescript
const computeTags = (ctx: Omit<Context, 'id' | 'idFull' | 'tags'>): Record<string, string> => {
  const labelValues: Record<string, string> = {
    namespace: ctx.namespace, tenant: ctx.tenant, environment: ctx.environment,
    stage: ctx.stage, name: ctx.name, region: ctx.region, project: ctx.project,
    attributes: ctx.attributes.join(ctx.delimiter),
  };

  const applyKeyCase = (key: string): string => applyCase(key, ctx.labelKeyCase);

  const labelTags = Object.fromEntries(
    ctx.labelsAsTags
      .filter(label => labelValues[label]?.length > 0)
      .map(label => [applyKeyCase(label), labelValues[label]])
  );

  return {
    ...labelTags,
    Name: ctx.id,           // Always set Name tag to computed ID
    ...ctx.additionalTagMap,
    ...ctx.tags,            // User-provided tags override computed ones
  };
};
```

---

## Pure Functions

### Internal implementation

```typescript
// src/context-fns.ts  (internal, not JSII surface)

export const makeContext = (props: ContextProps): Context => { ... }
// Applies all defaults, normalizes labels, computes id and tags.

export const extendContext = (base: Context, overrides: ContextProps): Context => { ... }
// Returns a new Context with overrides merged in (see merge rules below).

export const contextId = (ctx: Context): string => ctx.id;

export const contextTags = (ctx: Context): Record<string, string> => ctx.tags;

export const isEnabled = (ctx: Context): boolean => ctx.enabled;
```

### `extendContext` Merge Rules

| Field | Rule |
|-------|------|
| String labels (`namespace`, `environment`, etc.) | Override replaces base if override is non-empty string |
| `attributes` | Appended: `[...base.attributes, ...overrides.attributes ?? []]` |
| `tags` | Merged: `{ ...base.tags, ...overrides.tags }` |
| `additionalTagMap` | Merged: `{ ...base.additionalTagMap, ...overrides.additionalTagMap }` |
| `enabled` | `base.enabled && (overrides.enabled ?? true)` — false is sticky |
| `labelOrder`, `labelsAsTags` | Override replaces base if provided |
| All other fields | Override replaces base if provided (non-null/undefined) |

---

## JSII Export Strategy

JSII does not support standalone exported functions. Wrap them in a static-method class for the JSII surface, and also export as standalone named functions for TypeScript consumers.

```typescript
// src/index.ts

export { ContextProps, Context } from './context-types';

// JSII surface: static method class
export class ContextFns {
  public static make(props: ContextProps): Context { return makeContext(props); }
  public static extend(base: Context, overrides: ContextProps): Context { return extendContext(base, overrides); }
  public static id(ctx: Context): string { return ctx.id; }
  public static tags(ctx: Context): Record<string, string> { return ctx.tags; }
  public static isEnabled(ctx: Context): boolean { return ctx.enabled; }
}

// TypeScript-only convenience exports (tree-shaken, not JSII)
export { makeContext, extendContext, contextId, contextTags, isEnabled } from './context-fns';
```

---

## File Structure

```
packages/cdk-context/
├── src/
│   ├── index.ts          # Exports ContextProps, Context, ContextFns + standalone fns
│   ├── context-types.ts  # ContextProps and Context interface definitions
│   ├── context-fns.ts    # Pure functions (makeContext, extendContext, etc.)
│   └── context-defaults.ts  # Default values constant
└── test/
    └── context-fns.test.ts
```

---

## BDD Tests

### Feature: ID Computation

**Scenario: Default context produces correct ID**
- **Given** `makeContext({ namespace: '7p', environment: 'prod', name: 'queue' })`
- **When** `contextId(ctx)` is called
- **Then** the result is `'7p-prod-queue'`

**Scenario: Empty labels are excluded from ID**
- **Given** `makeContext({ namespace: '7p', name: 'queue' })` (no environment or stage)
- **When** `contextId(ctx)` is called
- **Then** the result is `'7p-queue'`

**Scenario: Attributes are appended to ID**
- **Given** `makeContext({ namespace: '7p', name: 'queue', attributes: ['dlq'] })`
- **When** `contextId(ctx)` is called
- **Then** the result is `'7p-queue-dlq'`

**Scenario: labelValueCase lower normalizes ID**
- **Given** `makeContext({ namespace: '7P', name: 'Queue', labelValueCase: 'lower' })`
- **When** `contextId(ctx)` is called
- **Then** the result is `'7p-queue'`

**Scenario: labelValueCase none preserves original casing**
- **Given** `makeContext({ namespace: '7P', name: 'Queue', labelValueCase: 'none' })`
- **When** `contextId(ctx)` is called
- **Then** the result contains `'7P'` and `'Queue'`

**Scenario: idLengthLimit truncates with MD5 suffix**
- **Given** `makeContext({ namespace: '7p', name: 'averylongresourcename', idLengthLimit: 12 })`
- **When** `contextId(ctx)` is called
- **Then** the result length is at most `12`
- **And** the result ends with a 5-character hash suffix

**Scenario: regexReplaceChars strips special characters**
- **Given** `makeContext({ name: 'my_resource.name' })`
- **When** `contextId(ctx)` is called
- **Then** the ID does not contain `_` or `.`

### Feature: extendContext

**Scenario: Attributes are appended not replaced**
- **Given** a base context with `attributes: ['api']`
- **When** `extendContext(base, { attributes: ['v2'] })` is called
- **Then** the resulting context has `attributes: ['api', 'v2']`
- **And** `contextId(result)` ends with `'api-v2'`

**Scenario: enabled false is sticky**
- **Given** a base context with `enabled: false`
- **When** `extendContext(base, { enabled: true })` is called
- **Then** the resulting context has `enabled: false`

**Scenario: String label override replaces base**
- **Given** a base context with `name: 'old'`
- **When** `extendContext(base, { name: 'new' })` is called
- **Then** `contextId(result)` contains `'new'` not `'old'`

**Scenario: Empty string override does not replace base**
- **Given** a base context with `name: 'original'`
- **When** `extendContext(base, { name: '' })` is called
- **Then** `contextId(result)` contains `'original'`

### Feature: Tag Computation

**Scenario: Name tag equals context ID**
- **Given** `makeContext({ namespace: '7p', name: 'queue' })`
- **When** `contextTags(ctx)` is called
- **Then** the tags include `{ Name: '7p-queue' }`

**Scenario: labelKeyCase title capitalizes tag keys**
- **Given** `makeContext({ namespace: '7p', labelKeyCase: 'title' })`
- **When** `contextTags(ctx)` is called
- **Then** the tag for namespace has key `'Namespace'`

**Scenario: Empty labels are excluded from tags**
- **Given** `makeContext({ namespace: '7p' })` (no tenant, environment, etc.)
- **When** `contextTags(ctx)` is called
- **Then** the tags do not include a key for `tenant` or `environment`

**Scenario: User-provided tags override computed tags**
- **Given** `makeContext({ namespace: '7p', tags: { Name: 'override' } })`
- **When** `contextTags(ctx)` is called
- **Then** the `Name` tag value is `'override'`

### Feature: isEnabled

**Scenario: Context is enabled by default**
- **Given** `makeContext({})` with no `enabled` prop
- **When** `isEnabled(ctx)` is called
- **Then** the result is `true`

**Scenario: Context is disabled when enabled is false**
- **Given** `makeContext({ enabled: false })`
- **When** `isEnabled(ctx)` is called
- **Then** the result is `false`

## README

Generate a `README.md` following the template in [`spec/AGENT-CONTEXT.md`](./AGENT-CONTEXT.md#readme-generation-requirement).
