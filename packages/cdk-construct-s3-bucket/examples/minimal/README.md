# cdk-construct-s3-bucket — Minimal Example

Demonstrates `@sevenpico/cdk-construct-s3-bucket` with required props only.
Creates one S3 bucket with all defaults: versioning enabled, S3-managed encryption,
all public access blocked, and `RETAIN` removal policy.

The `sevenpico` context values are inlined directly in each language's `cdk.json`
under the `context.sevenpico` key.

## Expected Resources

- `AWS::S3::Bucket` — named `acme-dev-app`, versioning on, S3-managed encryption, all public access blocked

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
