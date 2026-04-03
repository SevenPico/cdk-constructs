using Amazon.CDK;
using SevenPico.CdkBridge;
using SevenPico.CdkConstructS3LogStorage;

var app = new App();
var stack = new Stack(app, "S3LogStorageDisabledStack");

// Load context from CDK Bridge JSON. The cdk.json sets enabled: false,
// so the construct will create no resources.
var context = CdkBridge.Context(stack);

var storage = new S3LogStorage(stack, "LogStorage", new S3LogStorageProps
{
    Context = context,
});

// Bucket and NotificationQueue are null when disabled.
Console.WriteLine($"bucket: {storage.Bucket}");              // null
Console.WriteLine($"queue: {storage.NotificationQueue}");    // null

app.Synth();
