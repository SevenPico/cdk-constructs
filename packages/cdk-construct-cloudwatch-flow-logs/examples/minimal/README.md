# cdk-construct-cloudwatch-flow-logs — Minimal Example

Demonstrates `@sevenpico/cdk-construct-cloudwatch-flow-logs` with required props only.

Creates a CloudWatch Logs log group, an IAM role for VPC flow logs, and an EC2 flow log
capturing all traffic from the specified VPC with a 365-day log retention policy.

The `sevenpico` context values are inlined directly in each language's `cdk.json`
under the `context.sevenpico` key.

## Expected Resources

- `AWS::Logs::LogGroup` — 365-day retention
- `AWS::IAM::Role` — allows `vpc-flow-logs.amazonaws.com` to write logs
- `AWS::EC2::FlowLog` — captures ALL traffic for the VPC

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
