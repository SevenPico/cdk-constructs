# cdk-construct-http-api-gateway — Minimal Example

Demonstrates `@sevenpico/cdk-construct-http-api-gateway` with required props only.
Creates an HTTP API Gateway with a default stage and access log group using all defaults.

The `sevenpico` context values are inlined directly in each language's `cdk.json`
under the `context.sevenpico` key.

## Expected Resources

- `AWS::Logs::LogGroup` — named `/aws/apigateway/acme-dev-app`, 7-day retention
- `AWS::ApiGatewayV2::Api` — named `acme-dev-app`, HTTP protocol, execute endpoint disabled
- `AWS::ApiGatewayV2::Stage` — `$default` stage

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
