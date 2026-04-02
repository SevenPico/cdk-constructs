# cdk-construct-s3-bucket — S3-Managed Encrypted Example

Demonstrates `@sevenpico/cdk-construct-s3-bucket` with explicit S3-managed (AES256)
encryption. This makes the default encryption algorithm explicit without requiring a
KMS key.

The `sevenpico` context values are inlined directly in each language's `cdk.json`
under the `context.sevenpico` key.

## Expected Resources

- `AWS::S3::Bucket` — S3-managed AES256 encryption, versioning on, all public access blocked

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
