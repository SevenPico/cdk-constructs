# cdk-bridge — Disabled Example

Demonstrates `@sevenpico/cdk-bridge` with `enabled: false` set in the bridge fixture.

When a Context is disabled, `ctx.enabled` is `false` and constructs that receive it
should skip resource creation — mirroring Terraform's `count = 0` pattern.

Each language's `cdk.json` contains the `sevenpico` context inline with `"enabled": false`
set directly in the `context.sevenpico` block.

## Expected Output

```
Context ID:   acme-dev-app
Is enabled:   false
Context is disabled — skipping resource creation.
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
