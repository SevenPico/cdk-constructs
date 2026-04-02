# cdk-construct-eventbridge-rule — Comprehensive Example

Demonstrates `@sevenpico/cdk-construct-eventbridge-rule` with notable optional props exercised.

Creates an EventBridge rule on a named custom event bus, matching events by source and detail-type,
with a description and an explicit target ARN.

The `sevenpico` context values are inlined directly in each language's `cdk.json`
under the `context.sevenpico` key.

## Expected Resources

- `AWS::Events::Rule` — on `acme-dev-app-events` bus, matches `OrderPlaced` events from `acme.app`

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
