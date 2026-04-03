# cdk-construct-step-functions — Minimal Example

Demonstrates `@sevenpico/cdk-construct-step-functions` with required props only.

## Expected Resources
- `AWS::StepFunctions::StateMachine` — STANDARD type state machine
- `AWS::IAM::Role` — execution role
- `AWS::Logs::LogGroup` — CloudWatch log group

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
