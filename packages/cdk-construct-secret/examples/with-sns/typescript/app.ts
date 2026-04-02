import { App, Stack } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { Secret } from '@sevenpico/cdk-construct-secret';

const app = new App();
const stack = new Stack(app, 'SecretWithSnsStack');

const context = makeContext({ namespace: 'acme', environment: 'dev', stage: 'app' });

// Secret with SNS topic for change notifications, read principal, and description
new Secret(stack, 'Secret', {
  context,
  description: 'Application credentials with SNS notifications',
  createSns: true,
  secretReadPrincipals: [
    {
      type: 'AWS',
      identifiers: ['arn:aws:iam::123456789012:role/acme-app-role'],
    },
  ],
  snsPubPrincipals: [
    {
      type: 'Service',
      identifiers: ['secretsmanager.amazonaws.com'],
    },
  ],
  snsSubPrincipals: [
    {
      type: 'AWS',
      identifiers: ['arn:aws:iam::123456789012:role/acme-ops-role'],
    },
  ],
});

app.synth();
