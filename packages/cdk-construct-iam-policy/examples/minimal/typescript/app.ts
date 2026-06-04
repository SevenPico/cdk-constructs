import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { IamPolicy } from '@sevenpico/cdk-construct-iam-policy';

const app = new App();
const stack = new Stack(app, 'IamPolicyMinimalStack');

const context = CdkBridge.context(stack);

new IamPolicy(stack, 'Policy', {
  context,
  iamPolicyEnabled: true,
  policyStatements: {
    AllowS3Read: {
      effect: 'Allow',
      actions: ['s3:GetObject', 's3:ListBucket'],
      resources: ['*'],
    },
  },
});

app.synth();
