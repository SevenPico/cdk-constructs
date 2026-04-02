# cdk-construct-slackbot — With KMS Example

Demonstrates `@sevenpico/cdk-construct-slackbot` with a KMS-encrypted Slack token secret.

Supplies `slackTokenSecretKmsKeyArn` so the Lambda execution role gains `kms:Decrypt` and
`kms:DescribeKey` permissions in addition to `secretsmanager:GetSecretValue`.

## Expected Resources

- One SNS topic
- One Lambda function
- One IAM role (with SecretsManager + KMS permissions)
- One CloudWatch log group
- One SNS subscription

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

### C# (.NET)
```bash
cd dotnet && dotnet restore && cdk synth
```

### Go
```bash
cd go && go mod tidy && cdk synth
```
