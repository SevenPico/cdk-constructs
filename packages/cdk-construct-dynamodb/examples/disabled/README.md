# cdk-construct-dynamodb — Disabled Example

Demonstrates `@sevenpico/cdk-construct-dynamodb` with `enabled: false` — shows the zero-resources pattern where no AWS resources are created.

## Expected Resources
- None — the construct returns early when `enabled` is false

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
