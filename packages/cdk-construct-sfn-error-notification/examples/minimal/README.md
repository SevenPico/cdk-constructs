# cdk-construct-sfn-error-notification — Minimal Example

Demonstrates `@sevenpico/cdk-construct-sfn-error-notification` with required props only.

Uses CDK Bridge JSON to supply the SevenPico context and platform references:
state machine ARN and alarm SNS topic ARN.

## Expected Resources

- One SQS DLQ for failed executions
- Two CloudWatch alarms (rate and volume)
- One EventBridge rule routing failed executions to the DLQ
- One EventBridge Pipe replaying DLQ messages back into the state machine

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
