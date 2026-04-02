# cdk-construct-secret — Disabled Example

Demonstrates the `enabled: false` pattern for `@sevenpico/cdk-construct-secret`.
When the context has `enabled` set to `false`, the construct creates zero AWS resources.
This is useful for toggling infrastructure off in non-prod environments without removing code.

Each language's `cdk.json` contains the `sevenpico` context inline with `"enabled": false`
set directly in the `context.sevenpico` block.

## Expected Resources

None — the stack synthesizes with zero resources when `enabled` is false.

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
