# cdk-construct-kms-key — Minimal Example

Demonstrates `@sevenpico/cdk-construct-kms-key` with required props only.
Creates one KMS symmetric key and a default alias (`alias/acme-dev-app`)
with key rotation enabled and a 10-day pending deletion window.

The `sevenpico` context values are inlined directly in each language's `cdk.json`
under the `context.sevenpico` key.

## Expected Resources

- `AWS::KMS::Key` — symmetric key, rotation enabled, 10-day pending window
- `AWS::KMS::Alias` — `alias/acme-dev-app`

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
