# cdk-construct-cloudtrail-cloudwatch-alarms — Minimal Example

Demonstrates `@sevenpico/cdk-construct-cloudtrail-cloudwatch-alarms` with required props only.

Creates all 14 CIS Benchmark CloudWatch alarms watching a CloudTrail log group, with metric
filters and SNS notifications using default settings (300s period, threshold 1).

The `sevenpico` context values are inlined directly in each language's `cdk.json`
under the `context.sevenpico` key.

## Expected Resources

- 14 × `AWS::CloudWatch::Alarm` — one per CIS Benchmark control
- 14 × `AWS::Logs::MetricFilter` — one per alarm
- SNS topic and log group referenced by ARN/name (not created)

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
