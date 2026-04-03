# cdk-bridge — Basic Example

Demonstrates `@sevenpico/cdk-bridge` reading a Context from the CDK Bridge JSON fixture
and one Platform output (`vpcId`) via `CdkBridge.string()`.

The `sevenpico` context values are inlined directly in each language's `cdk.json`
under the `context.sevenpico` key — no external fixture file is required at runtime.

## Expected Output

```
Context ID:   acme-dev-app
Is enabled:   true
VPC ID:       vpc-0abc123456789def0
```

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
