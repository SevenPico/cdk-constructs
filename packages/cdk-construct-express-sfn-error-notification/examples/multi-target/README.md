# cdk-construct-express-sfn-error-notification — Multi-Target Example

Demonstrates `@sevenpico/cdk-construct-express-sfn-error-notification` with multiple Express state
machines in the `stepFunctions` map.

## Configured Features

- **Two Express state machines** — `processor` and `validator` entries
- **Independent per-machine resources** — each machine gets its own DLQ, rate alarm, volume alarm,
  and EventBridge Pipe
- **Shared SNS topics** — both machines send alerts to the same alarms topic

## Expected Resources

- Two SQS DLQs (one per machine)
- Four CloudWatch alarms (rate + volume per machine)
- Two EventBridge Pipes with IAM roles and CloudWatch log groups

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
