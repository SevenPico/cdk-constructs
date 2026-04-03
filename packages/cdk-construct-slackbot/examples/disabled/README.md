# cdk-construct-slackbot — Disabled Example

Demonstrates the `enabled: false` pattern for `@sevenpico/cdk-construct-slackbot`.

When a disabled context is passed, the construct skips all resource creation —
mirroring Terraform's `count = 0` behavior. No Lambda function, no Secrets Manager
access, no SQS queues are synthesized.

## Expected Resources

None. The CloudFormation template will be empty.

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
