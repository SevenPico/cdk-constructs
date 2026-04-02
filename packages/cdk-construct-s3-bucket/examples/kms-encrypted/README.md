# cdk-construct-s3-bucket — KMS Encrypted Example

Demonstrates `@sevenpico/cdk-construct-s3-bucket` with SSE-KMS encryption using a
customer-managed KMS key. This scenario diverges from the default (S3-managed encryption)
by adding a KMS grant resource and enforcing encrypted-uploads-only via bucket policy.

The `sevenpico` context values are inlined directly in each language's `cdk.json`
under the `context.sevenpico` key. The `kmsKeyArn` placeholder value must be replaced
with a real KMS key ARN before deploying.

## Expected Resources

- `AWS::S3::Bucket` — SSE-KMS encryption, bucket key enabled
- `AWS::S3::BucketPolicy` — deny unencrypted uploads
- `AWS::KMS::Grant` — grants S3 service permission to use the KMS key

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
