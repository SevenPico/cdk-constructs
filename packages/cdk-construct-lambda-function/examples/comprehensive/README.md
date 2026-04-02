# cdk-construct-lambda-function — Comprehensive Example

Demonstrates `@sevenpico/cdk-construct-lambda-function` with all major props exercised:
custom memory, timeout, arm64 architecture, X-Ray tracing, Lambda Insights, CloudWatch log
retention, reserved concurrency, environment variables, and SSM parameter access.

The `sevenpico` context values are inlined directly in each language's `cdk.json`
under the `context.sevenpico` key.

## Expected Resources

- `AWS::Logs::LogGroup` — named `/aws/lambda/acme-dev-app`, 30-day retention
- `AWS::IAM::Role` — execution role with `AWSLambdaBasicExecutionRole`,
  `AWSXRayDaemonWriteAccess`, `CloudWatchLambdaInsightsExecutionRolePolicy`,
  and an inline SSM read policy
- `AWS::Lambda::Function` — named `acme-dev-app`, 512 MB, 30 s timeout, `arm64`,
  X-Ray active tracing, 10 reserved concurrent executions, environment variables

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
