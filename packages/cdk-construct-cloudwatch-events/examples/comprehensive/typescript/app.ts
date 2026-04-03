import { App, Stack } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { CloudwatchEvents } from '@sevenpico/cdk-construct-cloudwatch-events';

const app = new App();
const stack = new Stack(app, 'CloudwatchEventsComprehensiveStack');

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
      description: 'Scheduled heartbeat every 5 minutes',
      schedule: 'rate(5 minutes)',
      targets: [
        {
          type: 'sns',
          arn: 'arn:aws:sns:us-east-1:123456789012:my-topic',
        },
      ],
    },
    {
      name: 'ec2-state-change',
      description: 'Reacts to EC2 instance state changes',
      eventPattern: '{"source":["aws.ec2"],"detail-type":["EC2 Instance State-change Notification"]}',
      targets: [
        {
          type: 'sqs',
          arn: 'arn:aws:sqs:us-east-1:123456789012:my-queue',
        },
      ],
    },
  ],
});

app.synth();
