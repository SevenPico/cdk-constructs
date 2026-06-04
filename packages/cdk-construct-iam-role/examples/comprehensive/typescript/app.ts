import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { IamRole } from '@sevenpico/cdk-construct-iam-role';

const app = new App();
const stack = new Stack(app, 'IamRoleComprehensiveStack');

const context = CdkBridge.context(stack);

new IamRole(stack, 'Role', {
  context,
  roleDescription: 'Acme EC2 instance role with S3 access',
  principals: { Service: ['ec2.amazonaws.com'] },
  managedPolicyArns: ['arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore'],
  instanceProfileEnabled: true,
  maxSessionDuration: 7200,
  policyDocuments: [
    JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Action: ['s3:GetObject', 's3:PutObject'],
          Resource: 'arn:aws:s3:::acme-dev-app-*/*',
        },
      ],
    }),
  ],
});

app.synth();
