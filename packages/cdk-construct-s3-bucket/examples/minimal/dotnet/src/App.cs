using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructS3Bucket;

var app = new App();
var stack = new Stack(app, "S3BucketMinimalStack");

var context = ContextFns.Make(new ContextProps { Namespace = "acme", Environment = "dev", Stage = "app" });

new S3Bucket(stack, "Bucket", new S3BucketProps
{
    Context = context,
});

app.Synth();
