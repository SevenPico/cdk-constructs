# cdk-construct-s3-bucket — Comprehensive Example

Demonstrates `@sevenpico/cdk-construct-s3-bucket` with all major optional props exercised:
versioning, transfer acceleration, object ownership, SSL-only enforcement, lifecycle rules
(transitions to STANDARD_IA and GLACIER, noncurrent version expiry, abort incomplete MPU),
and CORS rules.

The `sevenpico` context values are inlined directly in each language's `cdk.json`
under the `context.sevenpico` key.

## Expected Resources

- `AWS::S3::Bucket` — versioning on, transfer acceleration on, lifecycle rules, CORS rules
- `AWS::S3::BucketPolicy` — deny non-SSL requests

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
