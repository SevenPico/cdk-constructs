# cdk-construct-kms-key — Comprehensive Example

Demonstrates `@sevenpico/cdk-construct-kms-key` with all optional props exercised:
custom alias, custom description, key rotation disabled, a 14-day pending deletion
window, multi-region enabled, and a custom key policy.

The `sevenpico` context values are inlined directly in each language's `cdk.json`
under the `context.sevenpico` key.

## Expected Resources

- `AWS::KMS::Key` — symmetric key, rotation disabled, 14-day pending window, multi-region
- `AWS::KMS::Alias` — `alias/acme-dev-app-custom`

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
