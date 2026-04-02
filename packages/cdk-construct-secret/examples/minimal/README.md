# cdk-construct-secret — Minimal Example

Demonstrates `@sevenpico/cdk-construct-secret` with only the required `context` prop.
All other settings use defaults: a KMS key is auto-created, key rotation is enabled,
and no SNS topic is created.

The `sevenpico` context values are inlined directly in each language's `cdk.json`
under the `context.sevenpico` key.

## Expected Resources

- `AWS::SecretsManager::Secret` — secret with KMS encryption
- `AWS::KMS::Key` — auto-created encryption key with rotation enabled
- `AWS::KMS::Alias` — alias for the KMS key

## Running

See [EXAMPLES.md](../../../../../EXAMPLES.md) for the full local build workflow.

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
