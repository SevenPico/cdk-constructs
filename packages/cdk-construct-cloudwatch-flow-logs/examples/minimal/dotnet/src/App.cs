using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructCloudwatchFlowLogs;

var app = new App();
var stack = new Stack(app, "CloudwatchFlowLogsMinimalStack");

var context = ContextFns.Make(new ContextProps { Namespace = "acme", Environment = "dev", Stage = "app" });

new CloudwatchFlowLogs(stack, "FlowLogs", new CloudwatchFlowLogsProps
{
    Context = context,
    VpcId = "vpc-0123456789abcdef0",
});

app.Synth();
