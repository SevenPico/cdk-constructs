import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { IamPolicy } from '@sevenpico/cdk-construct-iam-policy';

const app = new App();
const stack = new Stack(app, 'IamPolicyComprehensiveStack');

const context = CdkBridge.context(stack);

new IamPolicy(stack, 'Policy', {
  context,
  iamPolicyEnabled: true,
  description: 'Acme application read/write policy',
  policyStatements: {
    AllowS3Read: {
      effect: 'Allow',
      actions: ['s3:GetObject', 's3:ListBucket'],
      resources: ['arn:aws:s3:::acme-dev-app-*', 'arn:aws:s3:::acme-dev-app-*/*'],
    },
    AllowDynamoDBWrite: {
      effect: 'Allow',
      actions: ['dynamodb:PutItem', 'dynamodb:UpdateItem', 'dynamodb:GetItem'],
      resources: ['arn:aws:dynamodb:us-east-1:123456789012:table/acme-dev-app-*'],
    },
    DenyDelete: {
      effect: 'Deny',
      actions: ['s3:DeleteObject', 'dynamodb:DeleteItem'],
      resources: ['*'],
    },
  },
});

app.synth();
