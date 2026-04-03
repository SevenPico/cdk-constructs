using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructCloudtrail;

var app = new App();
var stack = new Stack(app, "CloudtrailMinimalStack");

var context = ContextFns.Make(new ContextProps { Namespace = "acme", Environment = "dev", Stage = "app" });

new CloudTrail(stack, "Trail", new CloudtrailProps
{
    Context = context,
    S3BucketName = "my-cloudtrail-logs-bucket",
});

app.Synth();
