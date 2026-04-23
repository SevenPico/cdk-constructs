import { App, Stack } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { CloudwatchFlowLogs } from '@sevenpico/cdk-construct-cloudwatch-flow-logs';

const app = new App();
const stack = new Stack(app, 'CloudwatchFlowLogsComprehensiveStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT ?? '123456789012',
    region: process.env.CDK_DEFAULT_REGION ?? 'us-east-1',
  },
});

const context = makeContext({
  namespace: 'acme',
  environment: 'dev',
  stage: 'app',
  tags: { Owner: 'platform-team', CostCenter: 'engineering' },
});

new CloudwatchFlowLogs(stack, 'FlowLogs', {
  context,
  vpcId: 'vpc-0123456789abcdef0',
  trafficType: 'REJECT',
  cloudwatchLogRetentionDays: 90,
});

app.synth();
