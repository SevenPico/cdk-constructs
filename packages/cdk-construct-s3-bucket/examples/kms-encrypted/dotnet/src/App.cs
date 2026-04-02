using Amazon.CDK;
using SevenPico.CdkBridge;
using SevenPico.CdkConstructS3Bucket;

var app = new App();
var stack = new Stack(app, "S3BucketKmsEncryptedStack");

// Context and kmsKeyArn come from the bridge fixture (cdk.json sevenpico block)
var context = CdkBridge.Context(stack);
var kmsKeyArn = CdkBridge.String(stack, "kmsKeyArn");

// KMS-encrypted bucket — sseAlgorithm 'aws:kms' with a KMS key ARN from the bridge fixture.
// Creates a KMS grant resource in addition to the bucket.
new S3Bucket(stack, "Bucket", new S3BucketProps
{
    Context = context,
    SseAlgorithm = "aws:kms",
    KmsKeyArn = kmsKeyArn,
    BucketKeyEnabled = true,
    AllowEncryptedUploadsOnly = true,
});

app.Synth();
