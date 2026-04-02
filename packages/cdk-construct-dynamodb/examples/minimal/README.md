# cdk-construct-dynamodb — Minimal Example

Demonstrates `@sevenpico/cdk-construct-dynamodb` with required props only.

## Expected Resources
- `AWS::DynamoDB::Table` — PAY_PER_REQUEST billing, KMS-encrypted by default

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
