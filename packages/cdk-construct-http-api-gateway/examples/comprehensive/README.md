# cdk-construct-http-api-gateway — Comprehensive Example

Demonstrates `@sevenpico/cdk-construct-http-api-gateway` with all major props exercised:
CORS configuration, Lambda integrations, routes, auto-deploy, stage variables, and
custom CloudWatch log retention.

The `sevenpico` context values are inlined directly in each language's `cdk.json`
under the `context.sevenpico` key.

## Expected Resources

- `AWS::Logs::LogGroup` — named `/aws/apigateway/acme-dev-app`, 30-day retention
- `AWS::ApiGatewayV2::Api` — named `acme-dev-app`, CORS configured
- `AWS::ApiGatewayV2::Stage` — `$default` stage with auto-deploy and stage variables
- `AWS::ApiGatewayV2::Integration` — Lambda proxy integration
- `AWS::ApiGatewayV2::Route` — `GET /items` and `POST /items`

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
