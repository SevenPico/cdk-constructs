using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructCloudtrailCloudwatchAlarms;

var app = new App();
var stack = new Stack(app, "CloudtrailCloudwatchAlarmsMinimalStack");

var context = ContextFns.Make(new ContextProps { Namespace = "acme", Environment = "dev", Stage = "app" });

new CloudtrailCloudwatchAlarms(stack, "Alarms", new CloudtrailCloudwatchAlarmsProps
{
    Context = context,
    LogGroupName = "/aws/cloudtrail/acme-dev-app",
    SnsTopicArn = "arn:aws:sns:us-east-1:123456789012:acme-dev-app-alerts",
});

app.Synth();
