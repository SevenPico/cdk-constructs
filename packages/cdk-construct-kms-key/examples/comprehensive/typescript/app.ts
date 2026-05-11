import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { KmsKey } from '@sevenpico/cdk-construct-kms-key';

const app = new App();
const stack = new Stack(app, 'KmsKeyComprehensiveStack');

const context = CdkBridge.context(stack);

const policy = JSON.stringify({
  Version: '2012-10-17',
  Statement: [
    {
      Effect: 'Allow',
      Principal: { AWS: 'arn:aws:iam::123456789012:root' },
      Action: 'kms:*',
      Resource: '*',
    },
  ],
});

new KmsKey(stack, 'Key', {
  context,
  alias: 'alias/acme-dev-app-custom',
  description: 'Comprehensive KMS key example — all props exercised',
  enableKeyRotation: false,
  pendingWindowInDays: 14,
  multiRegion: true,
  policy,
});

app.synth();
