# cdk-construct-secret — With SNS Example

Demonstrates `@sevenpico/cdk-construct-secret` with an SNS topic for secret update
notifications. Includes read principals on the secret resource policy and pub/sub
principals on the SNS topic policy.

The `sevenpico` context values are inlined directly in each language's `cdk.json`
under the `context.sevenpico` key.

## Expected Resources

- `AWS::SecretsManager::Secret` — secret with KMS encryption and resource policy
- `AWS::KMS::Key` — auto-created encryption key
- `AWS::KMS::Alias` — alias for the KMS key
- `AWS::SNS::Topic` — topic for secret update notifications
- `AWS::SNS::TopicPolicy` — policy allowing publish and subscribe

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
