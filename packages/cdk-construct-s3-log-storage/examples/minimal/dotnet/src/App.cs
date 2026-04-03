using Amazon.CDK;
using SevenPico.CdkBridge;
using SevenPico.CdkConstructS3LogStorage;

var app = new App();
var stack = new Stack(app, "S3LogStorageMinimalStack");

// Load context from CDK Bridge JSON (sevenpico key in cdk.json context).
var context = CdkBridge.Context(stack);

new S3LogStorage(stack, "LogStorage", new S3LogStorageProps
{
    Context = context,
});

app.Synth();
