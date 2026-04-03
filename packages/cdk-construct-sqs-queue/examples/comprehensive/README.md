# cdk-construct-sqs-queue — Comprehensive Example

Demonstrates `@sevenpico/cdk-construct-sqs-queue` with notable optional props exercised.

Creates a main SQS queue with a dead-letter queue, custom visibility timeout, custom message
retention, and SQS-managed encryption. Tags are applied via context.

The `sevenpico` context values are inlined directly in each language's `cdk.json`
under the `context.sevenpico` key.

## Expected Resources

- `AWS::SQS::Queue` — main queue, 300s visibility timeout, 1-day retention, SQS-managed encryption
- `AWS::SQS::Queue` — dead-letter queue (DLQ) with SQS-managed encryption

## Running

See [EXAMPLES.md](../../../../EXAMPLES.md) for the full local build workflow.

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
