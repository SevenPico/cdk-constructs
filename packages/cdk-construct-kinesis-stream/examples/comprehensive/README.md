# cdk-construct-kinesis-stream — Comprehensive Example

Demonstrates `@sevenpico/cdk-construct-kinesis-stream` with notable optional props exercised.

## Expected Resources
- `AWS::Kinesis::Stream` — 2 shards, 48-hour retention, KMS-encrypted, PROVISIONED mode
- `AWS::Kinesis::StreamConsumer` — 1 registered consumer

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
