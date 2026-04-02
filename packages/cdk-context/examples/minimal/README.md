# cdk-context — Minimal Example

Demonstrates `@sevenpico/cdk-context` with required props only: `namespace`, `environment`, and `stage`.

The computed ID follows the default label order: `namespace-environment-stage` → `acme-dev-app`.

## Expected Output

```
Context ID:   acme-dev-app
Is enabled:   true
Tags:         { Name: 'acme-dev-app', Namespace: 'acme', Environment: 'dev', Stage: 'app' }
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
