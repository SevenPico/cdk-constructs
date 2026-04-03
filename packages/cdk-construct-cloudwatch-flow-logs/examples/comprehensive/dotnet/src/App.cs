using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructCloudwatchFlowLogs;

var app = new App();
var stack = new Stack(app, "CloudwatchFlowLogsComprehensiveStack");

var context = ContextFns.Make(new ContextProps
{
    Namespace = "acme",
    Environment = "dev",
    Stage = "app",
    Tags = new System.Collections.Generic.Dictionary<string, string>
    {
        { "Owner", "platform-team" },
        { "CostCenter", "engineering" },
    },
});

new CloudwatchFlowLogs(stack, "FlowLogs", new CloudwatchFlowLogsProps
{
    Context = context,
    VpcId = "vpc-0123456789abcdef0",
    TrafficType = "REJECT",
    CloudwatchLogRetentionDays = 90,
});

app.Synth();
