import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { KmsKey } from '@sevenpico/cdk-construct-kms-key';

const app = new App();
const stack = new Stack(app, 'KmsKeySymmetricHmacStack');

const context = CdkBridge.context(stack);

// HMAC_256 + GENERATE_VERIFY_MAC creates an HMAC key for MAC generation/verification.
// Key rotation is not supported for HMAC keys.
new KmsKey(stack, 'Key', {
  context,
  keySpec: 'HMAC_256',
  keyUsage: 'GENERATE_VERIFY_MAC',
  enableKeyRotation: false,
  alias: 'alias/acme-dev-app-hmac',
  description: 'HMAC-256 key for MAC generation and verification',
});

app.synth();
