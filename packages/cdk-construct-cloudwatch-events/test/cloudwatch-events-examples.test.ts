import { makeContext } from '@sevenpico/cdk-context';
import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { CloudwatchEvents } from '../src/cloudwatch-events';

function makeStack(): Stack {
  const app = new App();
  return new Stack(app, 'TestStack');
}

const CONTEXT = makeContext({ namespace: 'acme', environment: 'dev', stage: 'app' });

const SNS_TARGET = {
  type: 'sns',
  arn: 'arn:aws:sns:us-east-1:123456789012:my-topic',
};

describe('Example: minimal', () => {
  let template: Template;
  beforeAll(() => {
    const stack = makeStack();
    new CloudwatchEvents(stack, 'Events', {
      context: CONTEXT,
      rules: [
        {
          name: 'heartbeat',
          schedule: 'rate(5 minutes)',
          targets: [SNS_TARGET],
        },
      ],
    });
    template = Template.fromStack(stack);
  });
  test('creates exactly 1 EventBridge rule', () => {
    template.resourceCountIs('AWS::Events::Rule', 1);
  });
});

describe('Example: comprehensive', () => {
  let template: Template;
  beforeAll(() => {
    const stack = makeStack();
    new CloudwatchEvents(stack, 'Events', {
      context: CONTEXT,
      rules: [
        {
          name: 'heartbeat',
          description: 'Scheduled heartbeat every 5 minutes',
          schedule: 'rate(5 minutes)',
          targets: [SNS_TARGET],
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
    template = Template.fromStack(stack);
  });
  test('creates exactly 2 EventBridge rules', () => {
    template.resourceCountIs('AWS::Events::Rule', 2);
  });
});

describe('Example: disabled', () => {
  let template: Template;
  beforeAll(() => {
    const stack = makeStack();
    new CloudwatchEvents(stack, 'Events', {
      context: makeContext({ namespace: 'acme', environment: 'dev', stage: 'app', enabled: false }),
      rules: [
        {
          name: 'heartbeat',
          schedule: 'rate(5 minutes)',
          targets: [SNS_TARGET],
        },
      ],
    });
    template = Template.fromStack(stack);
  });
  test('creates zero EventBridge rules when disabled', () => {
    template.resourceCountIs('AWS::Events::Rule', 0);
  });
});
