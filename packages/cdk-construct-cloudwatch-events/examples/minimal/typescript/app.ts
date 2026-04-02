import { App, Stack } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { CloudwatchEvents } from '@sevenpico/cdk-construct-cloudwatch-events';

const app = new App();
const stack = new Stack(app, 'CloudwatchEventsMinimalStack');

const context = makeContext({
  namespace: 'acme',
  environment: 'dev',
  stage: 'app',
});

new CloudwatchEvents(stack, 'Events', {
  context,
  rules: [
    {
      name: 'heartbeat',
      schedule: 'rate(5 minutes)',
      targets: [
        {
          type: 'sns',
          arn: 'arn:aws:sns:us-east-1:123456789012:my-topic',
        },
      ],
    },
  ],
});

app.synth();
