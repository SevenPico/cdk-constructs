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

### Loading Context from `cdk.json`

Use `@sevenpico/cdk-bridge` to load context from your CDK app's context file instead of constructing it in code:

```typescript
import { CdkBridge } from '@sevenpico/cdk-bridge';

const ctx = CdkBridge.fromApp(app, 'sevenpico');
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

- `test/{name}-fns.test.ts` — pure function tests (no CDK stack required)
- `test/{name}.test.ts` — BDD scenarios using `Template.fromStack()` CDK assertions

### Architecture

All constructs follow a strict functional architecture:

- **`src/{name}-fns.ts`** — pure functions, all logic, fully unit-testable
- **`src/{name}.ts`** — thin CDK `Construct` class, no logic, only imperative CDK calls
- **`src/index.ts`** — JSII public surface, re-exports only

## License

Apache 2.0 — see [LICENSE](./LICENSE).
