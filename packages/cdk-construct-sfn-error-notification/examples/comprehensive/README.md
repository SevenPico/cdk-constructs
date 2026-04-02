# cdk-construct-sfn-error-notification — Comprehensive Example

Demonstrates `@sevenpico/cdk-construct-sfn-error-notification` with all optional props.

## Configured Features

- **KMS-encrypted DLQ** — `sqsKmsKeyArn` from CDK Bridge JSON
- **Custom queue name** — overrides the default context-derived name
- **Custom alarm names** — explicit rate and volume alarm names
- **Alarm tuning** — custom evaluation periods and datapoints-to-alarm
- **EventBridge Pipe tuning** — batch size, log level, custom pipe name
- **CloudWatch log retention** — 30 days instead of default 90
- **Custom input template** — passes full execution detail to reprocessing state machine

## Expected Resources

- One KMS-encrypted SQS DLQ
- Two CloudWatch alarms with custom names and tuned thresholds
- One EventBridge rule routing failed executions to the DLQ
- One EventBridge Pipe with custom name, batch size, and log level

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

### C#
```bash
cd dotnet && dotnet restore src/ && cdk synth
```

### Go
```bash
cd go && go mod tidy && cdk synth
```
