# SevenPico CDK Constructs — Claude Code Guidelines

## Cost Control: Model Usage

**Always use Sonnet, never Opus, for agent spawns.**

- `settings.local.json` pins the orchestrator session to `claude-sonnet-4-6`
- When spawning agents via the `Agent` tool, always pass `"model": "sonnet"` explicitly — do not rely on inheritance alone
- Never pass `"model": "opus"` unless there is an explicit user request for a specific task

This project runs long orchestration sessions with many agent spawns. Opus costs ~15x Sonnet at scale.

## NanoClip Agent Team

Agents are defined in `.nanoclip/agents/`. All agents specify `claude-sonnet-4-6` in their JSON.

The pipeline for each construct: resource-specialist/pattern-specialist → code-reviewer → qa-engineer → lead-engineer merges.

Short-lived agents (code-reviewer, qa-engineer, resource-specialist, pattern-specialist) are spawned fresh per task/PR and shut down after completing their role. lead-engineer is the long-running coordinator.

## Repo
jsii monorepo. `packages/{name}/` = independent npm package. Consumers install from GitHub release tarballs (`develop-latest`). Feature branches → `develop` via PR.

## Build
```bash
npm run compile --workspace=packages/{name}   # fast, no docgen
# Full build always fails on docgen (pre-existing jsii cross-workspace assembly issue — harmless)
```

## Construct Conventions

**isEnabled guard — required on every construct:**
```typescript
export class Foo extends Construct {
  public readonly bar?: CfnBar;            // all fields optional
  constructor(scope, id, props) {
    super(scope, id);
    if (!isEnabled(props.context)) return; // early exit, fields stay undefined
    this.bar = new CfnBar(...);
  }
}
```

**Naming:** `contextId(props.context)` always — never hardcode. `extendContext(ctx, { name })` for child constructs.

**IamRole trust:** Override `CfnRole.assumeRolePolicyDocument` after L2 construction — L2 `assumedBy` is placeholder only.

**StepFunctions definition:** `JSON.stringify(def)` → `DefinitionBody.fromString`. CDK tokens in strings → `Fn::Sub` at deploy.
- Fail states: `CausePath`/`ErrorPath` for dynamic values — NOT `'Cause.$'`
- `http:invoke ResponseBody` = already-parsed JSON object when `Content-Type: application/json` — no `States.StringToJson`
- `http:invoke` non-2xx → task failure, not result — use `Catch`, not Choice defaults

**HttpApiGateway + openApiBody:** `CfnApi` gets `{ body }` only — `name/corsConfiguration/description/disableExecuteApiEndpoint/tags` all dropped. Inject CORS: `apiSpec['x-amazon-apigateway-cors'] = {...}`. Lambda authorizer: `type: apiKey` required (not `type: http`) — `http/bearer` silently ignored.

**LambdaFunction bundling:** `bundlingAssetDir` = CDK fingerprint root. Docker fallback uses `relEntry = path.relative(assetDir, entry)` (POSIX-normalized) — ensures unique asset hashes when multiple Lambdas share same `bundlingAssetDir`.

## Gotchas

| Construct | Gotcha |
|-----------|--------|
| `cdk-bridge` | Empty string throws on `namespace/environment/stage`. `bridgeConfigToContextProps` drops `tenant/region/project/labelOrder`. |
| `cdk-context` | `extendContext`: `attributes` concatenates; empty string override = silent no-op. |
| `LambdaFunction` | VPC/EFS via `CfnFunction` escape hatch. `-1` reserved concurrency → `undefined`. |
| `HttpApiGateway` | `disableExecuteApiEndpoint` defaults `true` (non-OpenAPI mode). Log retention defaults 7d. |
| `KmsKey` | Always `RETAIN` — survives stack destroy. |
| `IamPolicy` | `json` always populated even disabled. Resource only when `iamPolicyEnabled: true` (default `false`). |
| `S3Bucket` | `allowEncryptedUploadsOnly + sseAlgorithm: AES256` = all uploads blocked. `objectOwnership` defaults `BucketOwnerEnforced`. |
| `S3LogStorage` | `objectOwnership` defaults `ObjectWriter` — required for S3 server-access log delivery. |
| `SqsQueue` | `iamPolicyLimitToCurrentAccount` defaults `true` — blocks cross-account consumers. |
| `Sns` | Pass KMS alias WITH `alias/` prefix. DLQ redrive only patches subscriptions created at construct time. |
| `Dynamodb` | GSI hash key type hardcoded `STRING`. |
| `AuroraDsql` | Most props silently ignored — only `deleteProtection` + `isEnabled` affect output. |
| `CloudwatchFlowLogs` | `Vpc.fromLookup` — stack must have concrete `env: { account, region }`. |
| `SfnErrorNotification` | Pipe re-starts FIRE_AND_FORGET — failed re-starts loop; state machine needs circuit-breaker. |
| `RedshiftCluster` | `adminPassword` = plaintext in template. |
| `S3Website` | `s3AccessLogBucketId` = bucket name, not construct ID. ACM cert must be `us-east-1`. |
