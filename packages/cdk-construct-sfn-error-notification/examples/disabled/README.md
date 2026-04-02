# cdk-construct-sfn-error-notification — Disabled Example

Demonstrates that `@sevenpico/cdk-construct-sfn-error-notification` creates zero resources when the
SevenPico context has `enabled: false`.

## How It Works

The construct checks `isEnabled(context)` on construction. When `enabled` is `false` the constructor
returns immediately, leaving all output properties `undefined` and producing no CloudFormation
resources.

## Expected Resources

None — the stack synthesises to an empty template.

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
