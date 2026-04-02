# cdk-construct-s3-website — Comprehensive Example

Demonstrates `@sevenpico/cdk-construct-s3-website` with all major props exercised:
WAF, CloudFront access logging, custom error responses, CORS allowed origins, geo restriction,
DNS alias (Route53 A record), deployment principal IAM role, and TLS protocol version.

The `sevenpico` context values are inlined directly in each language's `cdk.json`
under the `context.sevenpico` key.

## Expected Resources

- `AWS::S3::Bucket` — origin bucket
- `AWS::CloudFront::Distribution` — distribution with WAF, logging, geo restriction
- `AWS::CloudFront::OriginAccessControl` — OAC for secure S3 access
- `AWS::WAFv2::WebACL` — WAF web ACL (CLOUDFRONT scope)
- `AWS::Route53::RecordSet` — A alias record pointing at CloudFront

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
