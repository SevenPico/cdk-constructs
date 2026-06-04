import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { IamUser } from '@sevenpico/cdk-construct-iam-user';

const app = new App();
const stack = new Stack(app, 'IamUserComprehensiveStack');

const context = CdkBridge.context(stack);

new IamUser(stack, 'User', {
  context,
  userName: 'alice@example.com',
  path: '/engineering/',
  groups: ['developers', 'readonly'],
  loginProfileEnabled: true,
  passwordResetRequired: true,
  passwordLength: 32,
});

app.synth();
