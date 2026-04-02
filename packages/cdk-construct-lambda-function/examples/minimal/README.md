# cdk-construct-lambda-function — Minimal Example

Demonstrates `@sevenpico/cdk-construct-lambda-function` with required props only.
Creates a Lambda function sourced from S3 with all defaults: 128 MB memory, 3-second
timeout, x86_64 architecture, plus a CloudWatch log group and execution IAM role.

The `sevenpico` context values are inlined directly in each language's `cdk.json`
under the `context.sevenpico` key.

## Expected Resources

- `AWS::Logs::LogGroup` — named `/aws/lambda/acme-dev-app`
- `AWS::IAM::Role` — execution role with `AWSLambdaBasicExecutionRole`
- `AWS::Lambda::Function` — named `acme-dev-app`, runtime `nodejs20.x`, 128 MB, 3 s timeout

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
