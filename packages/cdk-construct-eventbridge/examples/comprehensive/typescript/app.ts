import { App, Stack } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { Eventbridge } from '@sevenpico/cdk-construct-eventbridge';

const app = new App();
const stack = new Stack(app, 'EventbridgeComprehensiveStack');

const context = makeContext({
  namespace: 'acme',
  environment: 'dev',
  stage: 'app',
  tags: { Owner: 'platform-team', CostCenter: 'engineering' },
});

new Eventbridge(stack, 'Bus', {
  context,
  eventBusName: 'acme-dev-app-events',
});

app.synth();
