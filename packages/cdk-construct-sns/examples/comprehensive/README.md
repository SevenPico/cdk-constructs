# cdk-construct-sns — Comprehensive Example

Demonstrates `@sevenpico/cdk-construct-sns` with notable optional props exercised.

## Expected Resources
- `AWS::SNS::Topic` — KMS-encrypted with EventBridge publish permission
- `AWS::SQS::Queue` — Dead-letter queue for failed deliveries
- `AWS::SNS::TopicPolicy` — Topic policy allowing EventBridge to publish

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
