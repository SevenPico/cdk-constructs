# cdk-construct-eventbridge — Disabled Example

Demonstrates `@sevenpico/cdk-construct-eventbridge` with `enabled: false` set in the context.

When disabled, the construct returns early and synthesizes zero AWS resources.

The `sevenpico` context values are inlined directly in each language's `cdk.json`
under the `context.sevenpico` key, with `"enabled": false`.

## Expected Resources

None — the construct exits early when `isEnabled(context)` returns `false`.

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
