import { App, Stack } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { IamRole } from '@sevenpico/cdk-construct-iam-role';

const app = new App();
const stack = new Stack(app, 'IamRoleMinimalStack');

const context = makeContext({
  namespace: 'acme',
  environment: 'dev',
  stage: 'app',
});

new IamRole(stack, 'Role', {
  context,
  roleDescription: 'Acme application role',
  principals: { Service: ['lambda.amazonaws.com'] },
});

app.synth();
