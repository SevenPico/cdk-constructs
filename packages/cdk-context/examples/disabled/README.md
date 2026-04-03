# cdk-context — Disabled Example

Demonstrates the `enabled: false` pattern. All constructs that receive a disabled context
skip resource creation — mirroring Terraform's `count = 0` behavior.

Key behavior: the disabled flag is **sticky**. Extending a disabled context with
`enabled: true` does not re-enable it.

## Expected Output

```
Context ID:   acme-dev-app
Is enabled:   false
Child enabled: false
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
