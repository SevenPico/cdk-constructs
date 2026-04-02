# cdk-construct-slackbot — Minimal Example

Demonstrates `@sevenpico/cdk-construct-slackbot` with required props only.

Uses CDK Bridge JSON to supply the SevenPico context and the Slack token secret ARN.

## Expected Resources

- One SNS topic (notifications endpoint)
- One Lambda function (Slack message handler)
- One IAM role for the Lambda function
- One CloudWatch log group
- One SNS subscription linking the topic to the Lambda

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
