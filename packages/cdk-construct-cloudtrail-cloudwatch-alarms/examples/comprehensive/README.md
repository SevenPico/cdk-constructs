# cdk-construct-cloudtrail-cloudwatch-alarms — Comprehensive Example

Demonstrates `@sevenpico/cdk-construct-cloudtrail-cloudwatch-alarms` with notable optional props exercised.

Creates 4 targeted CIS Benchmark alarms (unauthorized API, root usage, IAM policy changes,
CloudTrail changes) with a custom metric namespace, 60-second evaluation period, and context tags.

The `sevenpico` context values are inlined directly in each language's `cdk.json`
under the `context.sevenpico` key.

## Expected Resources

- 4 × `AWS::CloudWatch::Alarm` — for the 4 enabled alarm IDs
- 4 × `AWS::Logs::MetricFilter` — one per alarm
- Custom namespace `AcmeSecurity` used for all metrics

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
