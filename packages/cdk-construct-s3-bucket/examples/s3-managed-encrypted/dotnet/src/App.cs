using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructS3Bucket;

var app = new App();
var stack = new Stack(app, "S3BucketS3ManagedEncryptedStack");

var context = ContextFns.Make(new ContextProps { Namespace = "acme", Environment = "dev", Stage = "app" });

// S3-managed encryption — AES256 (default). No KMS key needed.
// This is the same as the minimal scenario but makes the encryption explicit.
new S3Bucket(stack, "Bucket", new S3BucketProps
{
    Context = context,
    SseAlgorithm = "AES256",
});

app.Synth();
