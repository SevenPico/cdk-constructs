# cdk-construct-cloudtrail-cloudwatch-alarms — Disabled Example

Demonstrates `@sevenpico/cdk-construct-cloudtrail-cloudwatch-alarms` with `enabled: false` set in the CDK context.
When disabled, the construct returns early and no AWS resources are created.

## Expected Resources

None — when `enabled` is `false`, the construct creates zero resources.

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
