# cdk-construct-cloudwatch-flow-logs — Comprehensive Example

Demonstrates `@sevenpico/cdk-construct-cloudwatch-flow-logs` with notable optional props exercised.

Creates a CloudWatch Logs log group with 90-day retention, capturing only REJECT traffic
from the specified VPC, with context tags applied.

The `sevenpico` context values are inlined directly in each language's `cdk.json`
under the `context.sevenpico` key.

## Expected Resources

- `AWS::Logs::LogGroup` — 90-day retention
- `AWS::IAM::Role` — allows `vpc-flow-logs.amazonaws.com` to write logs
- `AWS::EC2::FlowLog` — captures REJECT traffic only for the VPC

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
