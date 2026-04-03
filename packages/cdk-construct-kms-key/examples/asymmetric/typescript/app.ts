import { App, Stack } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { KmsKey } from '@sevenpico/cdk-construct-kms-key';

const app = new App();
const stack = new Stack(app, 'KmsKeyAsymmetricStack');

const context = makeContext({
  namespace: 'acme',
  environment: 'dev',
  stage: 'app',
  tags: { Owner: 'platform-team', CostCenter: 'engineering' },
});

// RSA_2048 + SIGN_VERIFY creates an asymmetric key for signing operations.
// Key rotation is not supported for asymmetric keys.
new KmsKey(stack, 'Key', {
  context,
  keySpec: 'RSA_2048',
  keyUsage: 'SIGN_VERIFY',
  enableKeyRotation: false,
  alias: 'alias/acme-dev-app-signing',
  description: 'Asymmetric RSA signing key',
});

app.synth();
