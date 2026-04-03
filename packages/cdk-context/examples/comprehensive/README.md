# cdk-context — Comprehensive Example

Demonstrates `@sevenpico/cdk-context` with all available props exercised, including custom
delimiter, label ordering, case modes, `idLengthLimit`, attributes, and context extension.

## Expected Output

```
Context ID:    acme-dev-app-api-v2
Is enabled:    true
Tags:          { Name: 'acme-dev-app-api-v2', Namespace: 'acme', Environment: 'dev', Stage: 'app', Name: 'api', CostCenter: 'engineering', Owner: 'platform-team', ManagedBy: 'cdk' }
Child ID:      acme-dev-app-api-v2-worker
```

(ID may be truncated if length exceeds `idLengthLimit: 32`.)

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
