# cdk-construct-eventbridge-rule — Minimal Example

Demonstrates `@sevenpico/cdk-construct-eventbridge-rule` with required props only.

Creates one EventBridge rule matching events from `acme.app` source, targeting an SQS queue ARN.

The `sevenpico` context values are inlined directly in each language's `cdk.json`
under the `context.sevenpico` key.

## Expected Resources

- `AWS::Events::Rule` — matches `source: ["acme.app"]`, targets an SQS queue ARN

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
