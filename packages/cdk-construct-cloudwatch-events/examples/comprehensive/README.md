# cdk-construct-cloudwatch-events — Comprehensive Example

Demonstrates `@sevenpico/cdk-construct-cloudwatch-events` with multiple rules: a scheduled rule and an event-pattern rule.

## Expected Resources
- `AWS::Events::Rule` — rate-based schedule rule targeting an SNS topic
- `AWS::Events::Rule` — event-pattern rule matching EC2 state changes, targeting an SQS queue

## Running
See [EXAMPLES.md](../../../../EXAMPLES.md) for the full local build workflow.

### TypeScript
```bash
cd typescript && npm install && npx cdk synth
```

### Python
```bash
cd python && pip install -r requirements.txt && npx cdk synth
```

### Java
```bash
cd java && mvn package && npx cdk synth
```

### .NET
```bash
cd dotnet && dotnet restore && npx cdk synth
```

### Go
```bash
cd go && go mod download && npx cdk synth
```
