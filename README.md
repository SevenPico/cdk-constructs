# SevenPico CDK Constructs

A multi-language CDK construct library that ports SevenPico's open-source Terraform modules to AWS CDK. Write your infrastructure once in TypeScript — consume the same constructs from TypeScript, Python, Java, Go, or .NET.

## How It Works

Each construct in this library is compiled with [JSII](https://aws.github.io/jsii/), which generates idiomatic bindings for every CDK-supported language from a single TypeScript source. The constructs replicate the naming, tagging, and resource conventions of [SevenPico's Terraform modules](https://github.com/SevenPico), so teams can migrate incrementally without changing their resource naming or tagging strategy.

### Context System

All constructs share a common `Context` object (`@sevenpico/cdk-context`) that drives:

- **Deterministic naming** — resource IDs are derived from `namespace`, `environment`, `stage`, `name`, and `attributes` labels joined by a delimiter (e.g. `7p-prod-api-queue`).
- **Consistent tagging** — the same labels are automatically applied as tags to every resource.
- **Enabled flag** — set `enabled: false` to suppress all resource creation without removing the construct from your code, mirroring Terraform's `count = 0`.

```typescript
import { makeContext } from '@sevenpico/cdk-context';

const ctx = makeContext({
  namespace: '7p',
  environment: 'prod',
  stage: 'api',
  name: 'orders',
});
// Resources created with this context will be named: 7p-prod-api-orders
```

## Constructs

### Foundation

| Package | Description |
|---------|-------------|
| [`@sevenpico/cdk-context`](./packages/cdk-context) | Context object — naming, tagging, and enabled flag |
| [`@sevenpico/cdk-bridge`](./packages/cdk-bridge) | Load context from CDK context JSON (`cdk.json`) |

### Resource Constructs

| Package | AWS Resource |
|---------|-------------|
| [`@sevenpico/cdk-construct-kms-key`](./packages/cdk-construct-kms-key) | KMS Key |
| [`@sevenpico/cdk-construct-s3-bucket`](./packages/cdk-construct-s3-bucket) | S3 Bucket |
| [`@sevenpico/cdk-construct-s3-website`](./packages/cdk-construct-s3-website) | S3 Static Website |
| [`@sevenpico/cdk-construct-secret`](./packages/cdk-construct-secret) | Secrets Manager Secret |
| [`@sevenpico/cdk-construct-iam-role`](./packages/cdk-construct-iam-role) | IAM Role |
| [`@sevenpico/cdk-construct-iam-policy`](./packages/cdk-construct-iam-policy) | IAM Policy |
| [`@sevenpico/cdk-construct-iam-user`](./packages/cdk-construct-iam-user) | IAM User |
| [`@sevenpico/cdk-construct-lambda-function`](./packages/cdk-construct-lambda-function) | Lambda Function |
| [`@sevenpico/cdk-construct-sqs-queue`](./packages/cdk-construct-sqs-queue) | SQS Queue |
| [`@sevenpico/cdk-construct-sns`](./packages/cdk-construct-sns) | SNS Topic |
| [`@sevenpico/cdk-construct-kinesis-stream`](./packages/cdk-construct-kinesis-stream) | Kinesis Data Stream |
| [`@sevenpico/cdk-construct-eventbridge`](./packages/cdk-construct-eventbridge) | EventBridge Event Bus |
| [`@sevenpico/cdk-construct-eventbridge-rule`](./packages/cdk-construct-eventbridge-rule) | EventBridge Rule |
| [`@sevenpico/cdk-construct-dynamodb`](./packages/cdk-construct-dynamodb) | DynamoDB Table |
| [`@sevenpico/cdk-construct-redshift-cluster`](./packages/cdk-construct-redshift-cluster) | Redshift Cluster |
| [`@sevenpico/cdk-construct-ses`](./packages/cdk-construct-ses) | SES Email Identity |
| [`@sevenpico/cdk-construct-http-api-gateway`](./packages/cdk-construct-http-api-gateway) | HTTP API Gateway |
| [`@sevenpico/cdk-construct-step-functions`](./packages/cdk-construct-step-functions) | Step Functions State Machine |
| [`@sevenpico/cdk-construct-cloudtrail`](./packages/cdk-construct-cloudtrail) | CloudTrail Trail |
| [`@sevenpico/cdk-construct-cloudwatch-events`](./packages/cdk-construct-cloudwatch-events) | CloudWatch Event Rules |
| [`@sevenpico/cdk-construct-cloudwatch-flow-logs`](./packages/cdk-construct-cloudwatch-flow-logs) | VPC Flow Logs → CloudWatch |
| [`@sevenpico/cdk-construct-cloudtrail-cloudwatch-alarms`](./packages/cdk-construct-cloudtrail-cloudwatch-alarms) | CloudTrail + CloudWatch Alarms |

### Pattern Constructs

These compose multiple resource constructs into higher-level architectural patterns.

| Package | Pattern |
|---------|---------|
| [`@sevenpico/cdk-construct-s3-log-storage`](./packages/cdk-construct-s3-log-storage) | S3 bucket pre-configured for access log storage |
| [`@sevenpico/cdk-construct-lambda-error-notification`](./packages/cdk-construct-lambda-error-notification) | Lambda with DLQ and error alerting |
| [`@sevenpico/cdk-construct-sfn-error-notification`](./packages/cdk-construct-sfn-error-notification) | Standard Step Functions with error notification queue |
| [`@sevenpico/cdk-construct-express-sfn-error-notification`](./packages/cdk-construct-express-sfn-error-notification) | Express Step Functions with error notification queue |
| [`@sevenpico/cdk-construct-slackbot`](./packages/cdk-construct-slackbot) | Lambda + SNS Slackbot integration |

## Consuming Constructs

### TypeScript / JavaScript

```bash
npm install @sevenpico/cdk-context @sevenpico/cdk-construct-sqs-queue
```

```typescript
import { makeContext } from '@sevenpico/cdk-context';
import { SqsQueue } from '@sevenpico/cdk-construct-sqs-queue';

const ctx = makeContext({ namespace: '7p', environment: 'prod', name: 'orders' });
new SqsQueue(this, 'OrdersQueue', { context: ctx });
```

### Python

```bash
pip install sevenpico.cdk-context sevenpico.cdk-construct-sqs-queue
```

```python
from sevenpico.cdk_context import make_context
from sevenpico.cdk_construct_sqs_queue import SqsQueue

ctx = make_context(namespace="7p", environment="prod", name="orders")
SqsQueue(self, "OrdersQueue", context=ctx)
```

### The Platform Bridge: CDK Bridge JSON

SevenPico's infrastructure is organized into two layers: a **Terraform Platform** (VPC networking, DNS zones, shared KMS keys, account-level resources) and one or more **CDK Workloads** that deploy into it. The CDK Workloads need to reference Platform outputs — VPC IDs, subnet ARNs, hosted zone IDs, KMS key ARNs — without re-declaring them.

The **CDK Bridge JSON** is the handoff artifact. After each Terraform Platform apply, a JSON file is written to S3 containing all Platform outputs. It includes the SevenPico Context labels (`namespace`, `environment`, `stage`, `region`) plus any ARNs or IDs the Workload depends on.

Before running `cdk synth`, `cdk diff`, or `cdk deploy`, a helper script downloads the CDK Bridge JSON for the target region/stage from S3 and writes it to `~/.cdk.json` under the `sevenpico` context key. CDK loads `~/.cdk.json` automatically, making every Platform output available at synth time via `scope.node.tryGetContext('sevenpico')`.

```
Terraform Platform apply
  └── writes CDK Bridge JSON → S3 (per region/stage)

Before cdk synth:
  └── script downloads CDK Bridge JSON from S3 → ~/.cdk.json

cdk synth:
  └── CDK reads ~/.cdk.json → context available at synth time
  └── bridgeContext(scope) → Context object (naming, tagging, enabled)
  └── bridgeString(scope, 'vpcId') → Platform output value
```

Use `@sevenpico/cdk-bridge` to read the bridge context in your CDK app:

```typescript
import { App, Stack } from 'aws-cdk-lib';
import { bridgeContext, bridgeString } from '@sevenpico/cdk-bridge';

const app = new App();
const stack = new Stack(app, 'MyStack');

// SevenPico Context (naming, tagging, enabled) from Platform
const ctx = bridgeContext(stack);

// Arbitrary Platform outputs
const vpcId = bridgeString(stack, 'vpcId');
const subnetIds = bridgeString(stack, 'privateSubnetIds');
```

Example `~/.cdk.json` (written by the bridge setup script):

```json
{
  "context": {
    "sevenpico": {
      "namespace": "7p",
      "environment": "prod",
      "stage": "api",
      "region": "us-east-1",
      "tags": { "CostCenter": "platform" },
      "vpcId": "vpc-abc123",
      "privateSubnetIds": "subnet-aaa,subnet-bbb",
      "accountId": "123456789012"
    }
  }
}
```

## Development

### Prerequisites

- Node.js >= 18
- npm >= 9

### Setup

```bash
npm install
npx projen          # regenerate managed files
```

### Build

```bash
# Build all packages (respects nx dependency graph)
npx nx run-many --target=build --all

# Build a single package
npx nx build @sevenpico/cdk-construct-sqs-queue

# Build only packages affected by recent changes
npx nx affected --target=build
```

### Test

```bash
# Run all tests
npx nx run-many --target=test --all

# Test a single package
npx nx test @sevenpico/cdk-construct-sqs-queue

# Watch mode for a package
cd packages/cdk-construct-sqs-queue && npx jest --watch
```

Tests are written with **Jest** for pure function unit tests and **jest-cucumber** for BDD construct integration tests. Each construct has:

- `src/{name}-fns.test.ts` — pure function tests (no CDK stack required)
- `src/{name}.test.ts` — BDD scenarios using `Template.fromStack()` CDK assertions
- `src/{name}.feature` — Gherkin feature file consumed by jest-cucumber

### Architecture

All constructs follow a strict functional architecture:

- **`src/{name}-fns.ts`** — pure functions, all logic, fully unit-testable
- **`src/{name}.ts`** — thin CDK `Construct` class, no logic, only imperative CDK calls
- **`src/{name}-types.ts`** — JSII-compatible interfaces for all public props
- **`src/index.ts`** — JSII public surface, re-exports only

### Running a single construct end-to-end

```bash
# TypeScript compile check
cd packages/cdk-construct-sqs-queue
../../node_modules/.bin/tsc -p tsconfig.dev.json --noEmit

# Run tests for one package
npx nx test @sevenpico/cdk-construct-sqs-queue

# Or directly with jest in watch mode
cd packages/cdk-construct-sqs-queue
npx jest --watch
```

### Adding a new construct

1. **Create the package directory** under `packages/cdk-construct-{name}/`.

2. **Create the three source files** in `src/`:
   - `{name}-types.ts` — JSII-compatible props interface. All props must be `readonly`. No union types, generic types, or function types in public interfaces (JSII constraint).
   - `{name}-fns.ts` — Pure functions with all logic. Zero CDK side effects. Fully unit-testable without a CDK stack.
   - `{name}.ts` — Thin `Construct` subclass. The constructor calls `isEnabled(props.context)` and returns early if disabled. All CDK resource creation goes here; no logic beyond CDK wiring.

3. **Create `src/index.ts`** — re-export everything from the three source files.

4. **Write tests** in `src/`:
   - `{name}-fns.test.ts` — pure function unit tests
   - `{name}.feature` — Gherkin feature file with BDD scenarios
   - `{name}.test.ts` — jest-cucumber integration tests using `Template.fromStack()`

5. **Register in `package.json`** — copy an existing package's `package.json`, update `name`, JSII targets, and peer dependencies.

6. **Register in `nx.json`** — add the package to the nx workspace by running `npx projen` from the repo root after updating `.projenrc.ts`.

### Project conventions

**JSII constraints (public interfaces only):**
- All props must be `readonly`
- No union types (`string | number`), generic types (`Array<T>`), or function types in public interfaces
- Use `string[]` not `Array<string>`, `Record<string, string>` not `{ [key: string]: string }`
- All public types must be re-exported from `src/index.ts`

**Functional architecture rule:**
- `*-fns.ts` files must have zero CDK imports and zero side effects — they are pure TypeScript
- Construct files must have zero logic — only `if (!isEnabled(...)) return;` and CDK resource instantiation

**Context system:**
- Every construct accepts a `context: Context` prop for deterministic naming (`context.id`) and tagging (`contextTags(context)`)
- `isEnabled(context)` returns `false` when `context.enabled` is `false`; constructs return early and leave all public properties `undefined`
- Resource names are derived from context labels joined by `context.delimiter` (default `-`)

### Contributing workflow

- **Branch naming:** `feat/{package-name}` for new constructs, `fix/{package-name}` for bug fixes
- **Commit messages:** conventional commits format — `feat:`, `fix:`, `docs:`, `refactor:`
- **PR title emoji convention:** 🟠 needs code revision | 🟣 ready for QA | 🔴 needs QA revision | 🟢 ready to merge

## License

Apache 2.0 — see [LICENSE](./LICENSE).
