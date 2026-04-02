# cdk-construct-express-sfn-error-notification — Minimal Example

Demonstrates `@sevenpico/cdk-construct-express-sfn-error-notification` with required props only.

## Configured Features

- **Single Express state machine** — one entry in the `stepFunctions` map
- **Context-derived naming** — DLQ, alarms, and pipe named from context
- **Default alarm thresholds** — 1 datapoint, 5 evaluation periods

## Expected Resources

- One SQS DLQ
- Two CloudWatch alarms (rate + volume)
- One EventBridge Pipe with IAM role and CloudWatch log group

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
