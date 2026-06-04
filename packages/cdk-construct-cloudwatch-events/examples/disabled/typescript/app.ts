import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { CloudwatchEvents } from '@sevenpico/cdk-construct-cloudwatch-events';

const app = new App();
const stack = new Stack(app, 'CloudwatchEventsDisabledStack');

const context = CdkBridge.context(stack);

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
