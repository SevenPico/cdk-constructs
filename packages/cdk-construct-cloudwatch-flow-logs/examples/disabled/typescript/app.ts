import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { CloudwatchFlowLogs } from '@sevenpico/cdk-construct-cloudwatch-flow-logs';

const app = new App();
const stack = new Stack(app, 'CloudwatchFlowLogsDisabledStack');

const context = CdkBridge.context(stack);

new CloudwatchFlowLogs(stack, 'FlowLogs', {
  context,
  vpcId: 'vpc-0123456789abcdef0',
});

app.synth();
