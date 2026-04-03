# cdk-construct-sqs-queue — Minimal Example

Demonstrates `@sevenpico/cdk-construct-sqs-queue` with required props only.

Creates one SQS queue with all defaults: SQS-managed encryption (SSE-SQS), 30s visibility timeout,
4-day message retention, and no dead-letter queue.

The `sevenpico` context values are inlined directly in each language's `cdk.json`
under the `context.sevenpico` key.

## Expected Resources

- `AWS::SQS::Queue` — SQS-managed encryption, 30s visibility timeout, 4-day retention

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
