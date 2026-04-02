using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructCloudtrailCloudwatchAlarms;

var app = new App();
var stack = new Stack(app, "CloudtrailCloudwatchAlarmsComprehensiveStack");

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

new CloudtrailCloudwatchAlarms(stack, "Alarms", new CloudtrailCloudwatchAlarmsProps
{
    Context = context,
    LogGroupName = "/aws/cloudtrail/acme-dev-app",
    SnsTopicArn = "arn:aws:sns:us-east-1:123456789012:acme-dev-app-alerts",
    AlarmNamespace = "AcmeSecurity",
    AlarmPeriodSeconds = 60,
    AlarmEvaluationPeriods = 1,
    AlarmThreshold = 1,
    EnabledAlarms = new[] { "unauthorized-api", "root-usage", "iam-policy-changes", "cloudtrail-changes" },
});

app.Synth();
