import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { CloudwatchFlowLogs } from '@sevenpico/cdk-construct-cloudwatch-flow-logs';

const app = new App();
const stack = new Stack(app, 'CloudwatchFlowLogsMinimalStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT ?? '123456789012',
    region: process.env.CDK_DEFAULT_REGION ?? 'us-east-1',
  },
});

const context = CdkBridge.context(stack);

new CloudwatchFlowLogs(stack, 'FlowLogs', {
  context,
  vpcId: 'vpc-0123456789abcdef0',
});

app.synth();
