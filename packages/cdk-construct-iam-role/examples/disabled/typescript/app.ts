import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { IamRole } from '@sevenpico/cdk-construct-iam-role';

const app = new App();
const stack = new Stack(app, 'IamRoleDisabledStack');

const context = CdkBridge.context(stack);

new IamRole(stack, 'Role', {
  context,
  roleDescription: 'Acme application role',
  principals: { Service: ['lambda.amazonaws.com'] },
});

app.synth();
