# cdk-construct-s3-log-storage — Comprehensive Example

Demonstrates `@sevenpico/cdk-construct-s3-log-storage` with all significant optional props.

Uses CDK Bridge JSON to supply platform references: KMS key ARN and central logs bucket name.

## Configured Features

- **KMS encryption** — `sseAlgorithm: 'aws:kms'` with bucket key enabled
- **Access logging** — forwards this bucket's access logs to the central logs bucket
- **SQS notifications** — creates an SQS queue notified on `ObjectCreated` events under the `raw/` prefix
- **Lifecycle rules** — transitions objects to Glacier after 90 days, expires after 365 days
- **All public-access blocks** — explicitly set (same as defaults)
- **SSL-only policy** — denies non-HTTPS requests
- **Versioning** — enabled

## Expected Resources

- One S3 bucket named `acme-dev-app`
- One S3 bucket policy enforcing SSL-only requests
- One SQS queue named `acme-dev-app-notifications`

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
