# cdk-bridge — Basic Example

Demonstrates `@sevenpico/cdk-bridge` reading a Context from the CDK Bridge JSON fixture
and one Platform output (`vpcId`) via `CdkBridge.string()`.

The bridge fixture is loaded from the shared `examples/fixtures/bridge.cdk.json` via
the `@sevenpico/load-bridge` CDK context key.

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
