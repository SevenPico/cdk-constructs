# CDK Bridge JSON Fixture

This directory contains a shared CDK context fixture used by all SevenPico
construct examples during local development.

## What is CDK Bridge JSON?

SevenPico constructs use the `@sevenpico/cdk-bridge` package to read
per-environment platform configuration at CDK synth time. This configuration
is normally loaded from an S3 bucket into `~/.cdk.json` by a setup script in
CI/CD pipelines or by an operator preparing a local environment.

The bridge reads all values from the CDK context key `sevenpico`. Any value
stored there is accessible in construct apps via `bridgeString(scope, 'keyName')`
or `bridgeValue(scope, 'keyName')`.

## The Fixture File

`bridge.cdk.json` contains realistic-looking placeholder values for a
`acme/dev/app` environment. It covers all cross-stack references that construct
examples may need:

| Key | Description |
|-----|-------------|
| `namespace`, `environment`, `stage` | Context labels used for naming |
| `region` | AWS region for the deployment |
| `tags` | Common resource tags |
| `vpcId`, `vpcCidrBlock`, `*SubnetIds` | VPC and subnet identifiers |
| `publicZoneId`, `privateZoneId`, ... | Route 53 hosted zone references |
| `certificateArn`, `wafWebAclArn` | ACM certificate and WAF Web ACL |
| `kmsKeyArn`, `logKmsKeyArn`, ... | KMS key ARNs for various encryption purposes |
| `slackTokenArn` | Secrets Manager ARN for the Slack bot token |
| `logsBucketName`, `cloudtrailBucketName` | Centralized S3 logging buckets |
| `alarmsSnsTopicArn` | SNS topic for CloudWatch alarms |
| `sharedSecurityGroupId` | Shared security group for Lambda and ECS tasks |

## Using the Fixture in Local Development

### Option 1 — Copy to `~/.cdk.json`

Merge the fixture into your global `~/.cdk.json` under the `context` key:

```json
{
  "context": {
    "sevenpico": { ...contents of bridge.cdk.json's "sevenpico" key... }
  }
}
```

### Option 2 — Pass as `cdk.json` context in an example app

Each example app's `cdk.json` can reference the fixture directly by embedding
the `sevenpico` object under the `context` key:

```json
{
  "app": "npx ts-node app.ts",
  "context": {
    "sevenpico": {
      "namespace": "acme",
      "environment": "dev",
      "stage": "app",
      "kmsKeyArn": "arn:aws:kms:us-east-1:123456789012:key/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"
    }
  }
}
```

### Option 3 — Load in code (TypeScript/JavaScript examples only)

Pass the fixture directly to `App` context at construction time:

```typescript
import bridgeFixture from '../../fixtures/bridge.cdk.json';

const app = new App({ context: bridgeFixture });
```

## Replacing Placeholder Values

For real deployments, replace placeholder values with real AWS resource IDs from
your Terraform platform outputs. The Terraform-to-CDK bridge setup script
handles this automatically in CI/CD.
