# cdk-bridge — Full Platform Example

Demonstrates `@sevenpico/cdk-bridge` reading all major Platform output sections
from the CDK Bridge JSON fixture: VPC, KMS keys, DNS hosted zones, logs bucket,
and alarms SNS topic.

Shows:
- `CdkBridge.context()` — builds a fully computed Context from the bridge labels
- `CdkBridge.string(scope, key)` — reads required string outputs
- `CdkBridge.string(scope, key, defaultValue)` — reads optional outputs with a fallback

## Expected Output

```
Context ID:          acme-dev-app
VPC ID:              vpc-0abc123456789def0
VPC CIDR:            10.0.0.0/16
KMS Key ARN:         arn:aws:kms:us-east-1:123456789012:key/aaaaaaaa-...
Log KMS Key ARN:     arn:aws:kms:us-east-1:123456789012:key/bbbbbbbb-...
Public Zone ID:      Z0PUBLICZONEID00000
Public Zone Name:    dev.acme.example.com
Logs Bucket:         acme-dev-app-logs-123456789012
Alarms Topic ARN:    arn:aws:sns:us-east-1:123456789012:acme-dev-app-alarms
Certificate ARN:     arn:aws:acm:us-east-1:123456789012:certificate/aaaaaaaa-...
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
