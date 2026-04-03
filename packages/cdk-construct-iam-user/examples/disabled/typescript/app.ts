import { App, Stack } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { IamUser } from '@sevenpico/cdk-construct-iam-user';

const app = new App();
const stack = new Stack(app, 'IamUserDisabledStack');

const context = makeContext({
  namespace: 'acme',
  environment: 'dev',
  stage: 'app',
  enabled: false,
});

new IamUser(stack, 'User', {
  context,
  userName: 'alice@example.com',
});

app.synth();
