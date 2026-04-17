# @sevenpico/cdk-context

Provides a deterministic naming and tagging system for all SevenPico CDK constructs. Computes a normalized resource `id` and `tags` map from a set of label values (namespace, environment, stage, name, etc.) using the same algorithm as `terraform-null-context`.

## Diagram

```mermaid
flowchart LR
    P[ContextProps] -->|makeContext| C[Context]
    C -->|id| N[Resource Name]
    C -->|tags| T[Tag Map]
    C -->|extendContext| C2[Child Context]
    C2 -->|id| N2[Child Resource Name]
```

## Context Chaining

The context system gives every SevenPico CDK construct a consistent, predictable name and set of tags derived from a small set of label values. A parent construct creates a `Context` and passes it to child constructs. Child constructs call `extendContext` to append attributes and derive a scoped name without repeating label values.

How the system works:

1. `makeContext(props)` normalizes labels, strips invalid characters, applies case transformations, and computes the resource `id` and `tags`.
2. `contextId(ctx)` returns the computed resource name (e.g. `7p-prod-api-queue`).
3. `contextTags(ctx)` returns a flat map of tags to apply to every AWS resource.
4. `extendContext(base, overrides)` merges overrides into the base context, appending `attributes` and re-computing `id` and `tags`.
5. `isEnabled(ctx)` returns `false` when `enabled: false` was set anywhere in the context chain, allowing constructs to suppress all resource creation without removing the call site.

Child resource name example:

```typescript
// Parent context id: '7p-prod-slackbot'
const dlqCtx = extendContext(props.context, { attributes: ['dlq'] });
// dlqCtx.id: '7p-prod-slackbot-dlq'
```

## Deployed Resources

This package contains no AWS resources. It is a pure TypeScript library with no CDK or AWS dependencies at runtime.

## Usage

See the [examples](./examples) directory for complete usage examples.

```typescript
import { makeContext, extendContext, contextId, contextTags, isEnabled } from '@sevenpico/cdk-context';

const ctx = makeContext({
  namespace: '7p',
  environment: 'prod',
  stage: 'api',
  name: 'queue',
});

console.log(ctx.id);            // '7p-prod-api-queue'
console.log(ctx.tags);          // { Namespace: '7p', Environment: 'prod', Stage: 'api', Name: '7p-prod-api-queue' }
console.log(isEnabled(ctx));    // true

const dlqCtx = extendContext(ctx, { attributes: ['dlq'] });
console.log(dlqCtx.id);         // '7p-prod-api-queue-dlq'
```

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| `namespace` | Organisation abbreviation, e.g. `'7p'` | `string` | `''` | |
| `tenant` | Customer identifier | `string` | `''` | |
| `environment` | Region or role, e.g. `'prod'`, `'uw2'` | `string` | `''` | |
| `stage` | Lifecycle stage, e.g. `'api'`, `'data'` | `string` | `''` | |
| `name` | Component name, e.g. `'queue'`, `'db'` | `string` | `''` | |
| `region` | AWS region identifier | `string` | `''` | |
| `project` | Project identifier | `string` | `''` | |
| `enabled` | When `false`, constructs skip all resource creation | `boolean` | `true` | |
| `delimiter` | Separator used when joining label values | `string` | `'-'` | |
| `attributes` | Additional suffixes appended to the end of the ID | `string[]` | `[]` | |
| `labelOrder` | Order in which labels are joined to form the ID | `string[]` | `['namespace', 'environment', 'stage', 'name', 'attributes']` | |
| `labelKeyCase` | Case applied to tag keys: `lower`, `title`, `upper` | `string` | `'title'` | |
| `labelValueCase` | Case applied to label values: `lower`, `upper`, `title`, `none` | `string` | `'lower'` | |
| `regexReplaceChars` | Regex of characters to strip from label values | `string` | `'[^-a-zA-Z0-9]'` | |
| `idLengthLimit` | Max ID length; `0` = unlimited. Exceeding appends MD5 suffix. | `number` | `0` | |
| `tags` | Additional tags passed through unchanged (override computed tags) | `Record<string, string>` | `{}` | |
| `additionalTagMap` | Extra key-value pairs added to all tags | `Record<string, string>` | `{}` | |
| `labelsAsTags` | Which labels are included as tags | `string[]` | `['namespace', 'environment', 'stage', 'name', 'tenant', 'attributes']` | |
| `descriptorFormats` | Custom descriptor format strings | `Record<string, string>` | `{}` | |
| `domainName` | Route53 zone domain name | `string` | `''` | |
| `dnsNameFormat` | DNS name format template | `string` | `'${name}.${domainName}'` | |

## Outputs (Context fields)

| Name | Description | Type |
|------|-------------|------|
| `id` | Computed resource name (after length limit) | `string` |
| `idFull` | Full computed ID before length limit is applied | `string` |
| `tags` | Merged tag map ready to apply to AWS resources | `Record<string, string>` |
| *(all inputs)* | Normalized values with defaults applied | *(see inputs)* |

## Special Considerations

- **`enabled` is sticky**: once set to `false` in a context chain, `extendContext` cannot re-enable it. This mirrors Terraform's `count = 0` semantics.
- **MD5 truncation**: when `idLengthLimit > 0` and the full ID exceeds the limit, the ID is truncated and a 5-character MD5 hex suffix is appended (format: `<truncated>-<hash>`). The suffix ensures uniqueness even when different long names share the same prefix.
- **JSII consumers**: use the `ContextFns` static class (`ContextFns.make`, `ContextFns.extend`, `ContextFns.id`, `ContextFns.tags`, `ContextFns.isEnabled`) when consuming this package from Python, Java, or .NET via JSII.

## Development

### Prerequisites

- **Node.js ≥ 18** with npm ≥ 9 (workspaces support required)
- **jsii ~5.9.0** — earlier 5.4.x releases do not support the `intersection-types` feature used by `aws-cdk-lib ≥ 2.246.0`; the correct version is pinned in `package.json`

Multi-language packaging (`package:java`, `package:python`, `package:dotnet`, `package:go`) additionally requires Maven, Python, .NET SDK, and Go installed. For local TypeScript development only the Node.js toolchain is needed.

### Installing dependencies

Run from the **monorepo root** (`../../`):

```bash
npm install
```

npm workspaces will hoist shared packages (including `aws-cdk-lib` and `constructs`) to the root `node_modules`. The build scripts automatically create workspace-local symlinks for these packages so that `jsii-docgen` can discover their JSII assemblies.

### Build commands

All commands should be run from the **monorepo root**, using the `--workspace` flag:

| Goal | Command |
|------|---------|
| TypeScript compile only | `npm run compile --workspace=packages/cdk-context` |
| Run tests | `npm run test --workspace=packages/cdk-context` |
| Compile + test + JS package | `npm run build --workspace=packages/cdk-context` |
| JS package only | `npm run package:js --workspace=packages/cdk-context` |
| Watch mode (incremental compile) | `npm run watch --workspace=packages/cdk-context` |

Alternatively, run the same tasks via `npx projen` from inside the package directory:

```bash
cd packages/cdk-context
npx projen compile   # jsii compile → lib/
npx projen test      # jest + eslint
npx projen build     # full build (compile → docgen → test → package)
```

> **Note on direct jsii invocation**: Do _not_ call `../../node_modules/.bin/jsii` directly. The projen task runner (`npx projen compile`) sets up the correct `PATH` and environment; invoking `jsii` directly bypasses that setup.

### Configuration files

This package is managed by [projen](https://github.com/projen/projen). To change `package.json`, task definitions, or tsconfig:

1. Edit `.projenrc.ts` in the monorepo root.
2. Run `npx projen` from the root to regenerate the managed files.
3. Do **not** edit `.projen/tasks.json`, `package.json` (this package), or `tsconfig.dev.json` directly — those are overwritten by projen.

## Roadmap

### v0.1.0

- [x] Initial implementation
- [x] BDD test coverage
- [x] Full `terraform-null-context` label and tag parity

### v0.2.0

- [ ] `descriptorFormats` evaluation
- [ ] DNS name computation via `domainName` / `dnsNameFormat`

## License

Apache 2.0 — see [LICENSE](../../LICENSE).
