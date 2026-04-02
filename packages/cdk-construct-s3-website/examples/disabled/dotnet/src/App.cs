using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructS3Website;

var app = new App();
var stack = new Stack(app, "S3WebsiteDisabledStack");

// Enabled = false — construct creates no resources
var context = ContextFns.Make(new ContextProps { Namespace = "acme", Environment = "dev", Stage = "app", Enabled = false });

new S3Website(stack, "Website", new S3WebsiteProps
{
    Context = context,
    AcmCertificateArn = "arn:aws:acm:us-east-1:123456789012:certificate/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
});

app.Synth();
