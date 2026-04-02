# cdk-construct-slackbot — Comprehensive Example

Demonstrates `@sevenpico/cdk-construct-slackbot` with all optional props:

- Multiple Slack channels in the `slackChannels` map
- KMS-encrypted Slack token secret (`slackTokenSecretKmsKeyArn`)
- Custom Lambda code path and runtime
- Custom CloudWatch log retention
- SNS publish principals (allow other services to publish)
- SNS subscribe principals

## Expected Resources

- One SNS topic with publish/subscribe policy grants
- One Lambda function (custom runtime)
- One IAM role (with SecretsManager + KMS permissions)
- One CloudWatch log group (custom retention)
- One SNS subscription

## Running

See [EXAMPLES.md](../../../../../EXAMPLES.md) for the full local build workflow.

### TypeScript
```bash
cd typescript && npm install && npx cdk synth
```

### Python
```bash
cd python && pip install -r requirements.txt && cdk synth
```

### Java
```bash
cd java && mvn compile && cdk synth
```

### C# (.NET)
```bash
cd dotnet && dotnet restore && cdk synth
```

### Go
```bash
cd go && go mod tidy && cdk synth
```
