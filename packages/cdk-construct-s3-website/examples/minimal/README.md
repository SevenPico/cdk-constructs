# cdk-construct-s3-website — Minimal Example

Demonstrates `@sevenpico/cdk-construct-s3-website` with only the required props:
a `context` and an `acmCertificateArn`. All other settings use defaults (versioning on,
public access blocked, `index.html` root object, TLSv1.2_2021).

The `sevenpico` context values are inlined directly in each language's `cdk.json`
under the `context.sevenpico` key.

## Expected Resources

- `AWS::S3::Bucket` — origin bucket with server-side encryption and public access blocked
- `AWS::CloudFront::Distribution` — HTTPS-only distribution pointing at the origin bucket
- `AWS::CloudFront::OriginAccessControl` — OAC for secure S3 access

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
