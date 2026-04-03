# cdk-construct-kms-key — Symmetric HMAC Example

Demonstrates `@sevenpico/cdk-construct-kms-key` creating an HMAC-256 key configured
for MAC generation and verification (`GENERATE_VERIFY_MAC`). This key type diverges
from the default symmetric key — key rotation must be explicitly disabled.

The `sevenpico` context values are inlined directly in each language's `cdk.json`
under the `context.sevenpico` key.

## Expected Resources

- `AWS::KMS::Key` — HMAC_256 key, key usage GENERATE_VERIFY_MAC, rotation disabled
- `AWS::KMS::Alias` — `alias/acme-dev-app-hmac`

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
