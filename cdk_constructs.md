# SevenPico CDK Constructs — Consumer Reference

## Installation

```json
"@sevenpico/cdk-bridge": "https://github.com/SevenPico/cdk-constructs/releases/download/develop-latest/sevenpico-cdk-bridge.tgz",
"@sevenpico/cdk-context": "https://github.com/SevenPico/cdk-constructs/releases/download/develop-latest/sevenpico-cdk-context.tgz",
"@sevenpico/cdk-construct-lambda-function": "https://github.com/SevenPico/cdk-constructs/releases/download/develop-latest/sevenpico-cdk-construct-lambda-function.tgz"
```

Run `npm install` after adding entries. To update: re-run `npm install` (tarballs pinned to `develop-latest`).

---

## cdk-context

Provides `Context` — the naming/tagging identity passed through all constructs.

```typescript
import { makeContext, extendContext, contextId, contextTags, isEnabled } from '@sevenpico/cdk-context';

const ctx = makeContext({ namespace: 'nc', environment: 'dev', name: 'api' });
// ctx.id = 'nc-dev-api'

const child = extendContext(ctx, { name: 'orders' });
// child.id = 'nc-dev-api-orders'

contextId(child)    // 'nc-dev-api-orders' — use for resource names
contextTags(child)  // { Namespace: 'nc', Environment: 'dev', Name: 'nc-dev-api-orders', ... }
isEnabled(child)    // true unless context.enabled = false
```

**Rules:**
- Never hardcode resource names — always `contextId(ctx)`
- `extendContext` concatenates `attributes` arrays; empty string overrides are ignored (base wins)
- `idLengthLimit > 0` truncates + appends 5-char md5 suffix
- Default `labelOrder`: `['namespace','environment','stage','name','attributes']` — `tenant/region/project` excluded unless overridden
- All construct public fields are `undefined` when `isEnabled(ctx) = false` — guard with `?.`

---

## cdk-bridge

Reads platform infrastructure outputs from CDK context. Context comes from `cdk.json` (static) + `~/.cdk.json` (platform outputs).

```typescript
import { CdkBridge } from '@sevenpico/cdk-bridge';

CdkBridge.string(this, 'namespace')                          // top-level key
CdkBridge.string(this, 'dataDsqlClusterArns.main')          // dot-notation for nested
CdkBridge.string(this, 'coreCognitoClientIds.admin-panel.app')
CdkBridge.string(this, 'optionalKey', 'default-value')      // with fallback
```

**Context shape (flat — no wrapper object):**
```json
{
  "context": {
    "namespace": "nc",
    "environment": "dev",
    "stage": "api",
    "dataDsqlClusterArns": { "main": "arn:aws:dsql:..." },
    "coreCognitoUserPoolIds": { "admin-panel": "us-east-1_XXXX" }
  }
}
```

**Rules:**
- `namespace`, `environment`, `stage` required — empty string throws
- `bridgeValue` returns `undefined` for missing optional keys (no throw)
- `bridgeString` throws if value is not a string

---

## LambdaFunction

```typescript
import { LambdaFunction } from '@sevenpico/cdk-construct-lambda-function';

const fn = new LambdaFunction(this, 'MyFn', {
  context: extendContext(ctx, { name: 'my-fn' }),
  handler: 'index.handler',
  runtime: 'nodejs20.x',
  entryPoint: './lambda/my-fn/index.ts',     // esbuild bundles at synth time
  bundlingAssetDir: './lambda/shared',       // fingerprint root — include shared source dirs
  bundlingExternalModules: [],               // [] = bundle everything incl. AWS SDK
  timeoutSeconds: 30,
  memorySizeMb: 256,
  cloudwatchLogsRetentionDays: 14,
  environment: { variables: { MY_VAR: 'value' } },
});

fn.fn       // lambda.Function | undefined
fn.role     // iam.Role | undefined
fn.logGroup // logs.LogGroup | undefined
```

**Code source priority:** `imageUri` (ECR) → `s3Bucket+s3Key` (S3 zip) → `entryPoint` (esbuild) → `filename` (local zip)

**`bundlingAssetDir`:** Set to parent directory when multiple Lambdas share source files (e.g., `client.ts`, `repository.ts`). CDK fingerprints the entire directory — changes to shared files trigger redeployment of all Lambdas using that dir. Without it, only the entry point's directory is watched.

**Adding IAM permissions:**
```typescript
fn.role?.addToPrincipalPolicy(new iam.PolicyStatement({
  actions: ['dsql:DbConnect'],
  resources: [clusterArn],
}) as any);
```

---

## HttpApiGateway

```typescript
import { HttpApiGateway } from '@sevenpico/cdk-construct-http-api-gateway';

const gw = new HttpApiGateway(this, 'Gateway', {
  context: extendContext(ctx, { name: 'data-api' }),
  openApiBody: apiSpec,                              // inject integrations before passing
  stages: [{ stageName: 'prod', autoDeploy: true }],
  accessLoggingEnabled: true,
  cloudwatchLogsRetentionDays: 14,
});

gw.api      // apigwv2.CfnApi | undefined — use gw.api.ref for API ID
gw.logGroup // logs.LogGroup | undefined

const url = `https://${gw.api!.ref}.execute-api.${region}.amazonaws.com/prod`;
```

**With `openApiBody` — inject before passing:**
```typescript
// CORS (corsConfiguration prop is ignored when openApiBody is set)
apiSpec['x-amazon-apigateway-cors'] = {
  allowOrigins: ['*'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'x-auth-token'],
};

// Lambda authorizer (type MUST be 'apiKey' — 'http/bearer' is silently ignored)
components.securitySchemes = {
  LambdaAuthorizer: {
    type: 'apiKey',
    name: 'x-auth-token',
    in: 'header',
    'x-amazon-apigateway-authorizer': {
      type: 'request',
      authorizerUri: `arn:aws:apigateway:${region}:lambda:path/.../invocations`,
      authorizerPayloadFormatVersion: '2.0',
      enableSimpleResponses: true,
      authorizerResultTtlInSeconds: 0,
    },
  },
};
apiSpec.security = [{ LambdaAuthorizer: [] }];

// Lambda integrations
paths['/orders']['post']['x-amazon-apigateway-integration'] = {
  type: 'aws_proxy',
  httpMethod: 'POST',
  uri: `arn:aws:apigateway:${region}:lambda:path/2015-03-31/functions/${fn.functionArn}/invocations`,
  payloadFormatVersion: '2.0',
};
```

**Grant Lambda invocation:**
```typescript
new lambda.CfnPermission(this, 'Permission', {
  action: 'lambda:InvokeFunction',
  functionName: fn.functionName,
  principal: 'apigateway.amazonaws.com',
  sourceArn: `arn:aws:execute-api:${region}:${account}:${gw.api!.ref}/*/*`,
});
```

---

## StepFunctions

```typescript
import { StepFunctions } from '@sevenpico/cdk-construct-step-functions';

const sfn = new StepFunctions(this, 'StateMachine', {
  context: extendContext(ctx, { name: 'my-sfn' }),
  roleDescription: 'My state machine execution role',  // required
  definition: {
    Comment: '...',
    StartAt: 'FirstState',
    States: { ... },
  },
});

sfn.stateMachine  // sfn.StateMachine | undefined
sfn.role          // iam.Role | undefined

sfn.role?.addToPrincipalPolicy(new iam.PolicyStatement({ ... }) as any);
```

**CDK tokens in definition strings work** — e.g., `` `${gatewayUrl}/orders` `` resolves via CloudFormation `Fn::Sub` at deploy time.

**ASL patterns:**
```typescript
// Dynamic Fail state — use CausePath, NOT 'Cause.$'
HttpTestFailed: {
  Type: 'Fail',
  Error: 'HttpError',
  CausePath: '$.lastHttpError.Cause',  // ✓
  // 'Cause.$': '$.x'                 // ✗ invalid ASL
},

// http:invoke — ResponseBody is already parsed JSON (Content-Type: application/json)
ValidateStatus: {
  Type: 'Choice',
  Choices: [{ Variable: '$.result.ResponseBody.status', StringEquals: 'active', Next: 'Pass' }],
  // Do NOT use States.StringToJson($.result.ResponseBody) — already an object
},

// http:invoke non-2xx → task failure — catch it, don't rely on Choice defaults
CreateOrder: {
  Resource: 'arn:aws:states:::http:invoke',
  Catch: [{ ErrorEquals: ['States.ALL'], ResultPath: '$.error', Next: 'HandleError' }],
  ...
},
```

---

## Secret

```typescript
import { Secret } from '@sevenpico/cdk-construct-secret';

const secret = new Secret(this, 'MySecret', {
  context: extendContext(ctx, { name: 'my-secret' }),
  description: 'My secret',
  secretString: JSON.stringify({ username: '', password: '' }),
  secretIgnoreChanges: true,   // prevents CDK from updating value after initial create
});

secret.smSecret  // secretsmanager.Secret | undefined
secret.kmsKey    // kms.Key | undefined
```

---

## S3Bucket

```typescript
import { S3Bucket } from '@sevenpico/cdk-construct-s3-bucket';

const bucket = new S3Bucket(this, 'MyBucket', {
  context: extendContext(ctx, { name: 'my-bucket' }),
  cloudwatchLogsRetentionDays: 14,
});

bucket.bucket  // s3.Bucket | undefined
```

Versioning defaults `true`. All public-access blocks default `true`. `objectOwnership` defaults `BucketOwnerEnforced` (ACLs off).

---

## KmsKey

```typescript
import { KmsKey } from '@sevenpico/cdk-construct-kms-key';

const key = new KmsKey(this, 'MyKey', {
  context: extendContext(ctx, { name: 'my-key' }),
});

key.key    // kms.Key | undefined
key.alias  // kms.Alias | undefined
```

Removal policy always `RETAIN` — key survives stack destroy.

---

## IamRole

```typescript
import { IamRole } from '@sevenpico/cdk-construct-iam-role';

const role = new IamRole(this, 'MyRole', {
  context: extendContext(ctx, { name: 'my-role' }),
  roleDescription: 'My role',
  principals: ['lambda.amazonaws.com'],
  policyDocuments: [JSON.stringify({ Version: '2012-10-17', Statement: [...] })],
});

role.role  // iam.Role | undefined
```

---

## Construct Quick Reference

| Construct | Key Props | Output Fields | Critical Gotcha |
|-----------|-----------|---------------|-----------------|
| `LambdaFunction` | `entryPoint`, `bundlingAssetDir`, `handler`, `runtime`, `environment` | `fn`, `role`, `logGroup` | `bundlingAssetDir` required for shared source; `-1` concurrency = no limit |
| `HttpApiGateway` | `openApiBody`, `stages`, `corsConfiguration` | `api`, `logGroup` | `openApiBody` drops all non-body props; inject CORS + authorizer into spec |
| `StepFunctions` | `definition`, `roleDescription` | `stateMachine`, `role` | `CausePath` not `'Cause.$'`; `ResponseBody` auto-parsed; non-2xx throws |
| `Secret` | `secretString`, `secretIgnoreChanges` | `smSecret`, `kmsKey` | `secretIgnoreChanges: true` prevents value drift post-deploy |
| `S3Bucket` | `sseAlgorithm`, `allowEncryptedUploadsOnly` | `bucket` | `allowEncryptedUploadsOnly + AES256` = all uploads blocked |
| `S3LogStorage` | `notificationsEnabled` | `bucket`, `notificationQueue` | `objectOwnership: ObjectWriter` — required for S3 log delivery |
| `KmsKey` | `pendingWindowInDays`, `multiRegion` | `key`, `alias` | Always RETAIN — manual cleanup needed |
| `IamRole` | `principals`, `policyDocuments`, `inlinePolicies` | `role` | `policyDocuments` merged; `inlinePolicies` separate named policies |
| `IamPolicy` | `iamPolicyEnabled`, `sourcePolicyDocuments` | `json`, `policy` | `iamPolicyEnabled` defaults `false` — no resource created without it |
| `Sns` | `subscriptions`, `deadLetterQueueEnabled` | `topic`, `deadLetterQueue` | KMS alias must include `alias/` prefix |
| `SqsQueue` | `iamPolicyLimitToCurrentAccount` | `queue`, `deadLetterQueue` | Cross-account consumers: set `iamPolicyLimitToCurrentAccount: false` |
| `Dynamodb` | `hashKey`, `rangeKey`, `gsi` | `table` | GSI hash key type hardcoded `STRING` |
| `Eventbridge` | `policyDocument` | `eventBus` | One resource policy per bus — multiple calls = last wins |
| `EventbridgeRule` | `targetArn`, `eventPattern` | `rule` | Generic `targetArn` path = no auto-grant; caller grants separately |
| `SqsQueue` | `enforceConsumerDeletion` | `queue` | `false` = RETAIN; needed when external consumers registered |
| `AuroraDsql` | `deleteProtection` | `cluster`, `clusterArn`, `clusterEndpoint` | Thin placeholder — most props silently ignored |
| `Ses` | `domain`, `dkimEnabled` | `emailIdentity`, `iamGroup`, `iamUser`, `accessKey` | Access key value only available at synth time |
| `CloudwatchFlowLogs` | `vpcId` | `logGroup`, `flowLog` | Requires concrete `env: { account, region }` on stack |
| `S3Website` | `acmCertificateArn`, `wafEnabled` | `originBucket`, `distribution`, `dnsRecord` | ACM cert must be `us-east-1`; log bucket props are names not IDs |
| `LambdaErrorNotification` | `lambdaRoleName`, `snsTopicArn` | `deadLetterQueue`, `rateAlarm`, `volumeAlarm` | `lambdaRoleName` must pre-exist at synth |
| `SfnErrorNotification` | `stateMachineArn`, `snsTopicArn` | `deadLetterQueue`, `eventbridgeRule`, `pipe` | Pipe uses FIRE_AND_FORGET — add circuit-breaker in state machine |
