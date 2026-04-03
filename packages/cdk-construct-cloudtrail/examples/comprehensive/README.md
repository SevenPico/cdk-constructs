# cdk-construct-cloudtrail — Comprehensive Example

Demonstrates `@sevenpico/cdk-construct-cloudtrail` with notable optional props exercised.

## Expected Resources
- `AWS::CloudTrail::Trail` — multi-region trail with insights, S3 data events
- `AWS::Logs::LogGroup` — CloudWatch Logs group for trail events (90-day retention)

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
