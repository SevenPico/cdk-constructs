using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructS3Bucket;

var app = new App();
var stack = new Stack(app, "S3BucketKmsEncryptedStack");

var context = ContextFns.Make(new ContextProps { Namespace = "acme", Environment = "dev", Stage = "app" });

// KMS-encrypted bucket — sseAlgorithm 'aws:kms' with a KMS key ARN.
// Creates a KMS grant resource in addition to the bucket.
new S3Bucket(stack, "Bucket", new S3BucketProps
{
    Context = context,
    SseAlgorithm = "aws:kms",
    KmsKeyArn = "arn:aws:kms:us-east-1:123456789012:key/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    BucketKeyEnabled = true,
    AllowEncryptedUploadsOnly = true,
});

app.Synth();
