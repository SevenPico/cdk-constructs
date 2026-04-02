# cdk-construct-cloudwatch-events — Minimal Example

Demonstrates `@sevenpico/cdk-construct-cloudwatch-events` with a single scheduled rule and one SNS target.

## Expected Resources
- `AWS::Events::Rule` — rate-based schedule rule targeting an SNS topic

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
