import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { IamUser } from '@sevenpico/cdk-construct-iam-user';

const app = new App();
const stack = new Stack(app, 'IamUserDisabledStack');

const context = CdkBridge.context(stack);

new IamUser(stack, 'User', {
  context,
  userName: 'alice@example.com',
});

app.synth();
