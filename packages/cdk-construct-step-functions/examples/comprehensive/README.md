# cdk-construct-step-functions — Comprehensive Example

Demonstrates `@sevenpico/cdk-construct-step-functions` with all major optional props: EXPRESS type, X-Ray tracing, CloudWatch logging, managed policy attachment, and a Task state invoking Lambda.

## Expected Resources
- `AWS::StepFunctions::StateMachine` — EXPRESS type, X-Ray tracing enabled
- `AWS::IAM::Role` — execution role with AWSLambda_ReadOnlyAccess managed policy
- `AWS::Logs::LogGroup` — CloudWatch log group with 30-day retention

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
