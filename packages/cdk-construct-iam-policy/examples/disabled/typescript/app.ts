import { App, Stack } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { IamPolicy } from '@sevenpico/cdk-construct-iam-policy';

const app = new App();
const stack = new Stack(app, 'IamPolicyDisabledStack');

const context = makeContext({
  namespace: 'acme',
  environment: 'dev',
  stage: 'app',
  enabled: false,
});

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
