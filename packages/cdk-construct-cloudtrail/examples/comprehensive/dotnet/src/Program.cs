using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructCloudtrail;

var app = new App();
var stack = new Stack(app, "CloudtrailComprehensiveStack");

var context = ContextFns.Make(new ContextProps { Namespace = "acme", Environment = "dev", Stage = "app" });

new CloudTrail(stack, "Trail", new CloudtrailProps
{
    Context = context,
    S3BucketName = "my-cloudtrail-logs-bucket",
    S3KeyPrefix = "cloudtrail/",
    IncludeGlobalServiceEvents = true,
    IsMultiRegionTrail = true,
    EnableLogFileValidation = true,
    CloudWatchLogsEnabled = true,
    CloudWatchLogsRetentionDays = 90,
    EnableInsights = true,
    ManagementEvents = "ReadWrite",
    DataEvents = new[]
    {
        new CloudtrailDataEventSelector
        {
            ResourceType = "AWS::S3::Object",
            ResourceArns = new[] { "arn:aws:s3:::" },
        },
    },
});

app.Synth();
