# cdk-construct-s3-log-storage — Minimal Example

Demonstrates `@sevenpico/cdk-construct-s3-log-storage` with required props only.

Uses CDK Bridge JSON to supply the SevenPico context. All optional props use defaults:
AES256 encryption, versioning enabled, all public-access blocks on, SSL-only policy,
`ObjectWriter` ownership, no notifications.

## Expected Resources

- One S3 bucket named `acme-dev-app`
- One S3 bucket policy enforcing SSL-only requests

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
