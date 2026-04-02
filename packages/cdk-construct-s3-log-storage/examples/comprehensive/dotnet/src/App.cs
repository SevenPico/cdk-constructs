using Amazon.CDK;
using SevenPico.CdkBridge;
using SevenPico.CdkConstructS3LogStorage;
using SevenPico.CdkConstructS3Bucket;

var app = new App();
var stack = new Stack(app, "S3LogStorageComprehensiveStack");

// Load context and platform references from CDK Bridge JSON.
var context = CdkBridge.Context(stack);
var logKmsKeyArn = CdkBridge.String(stack, "logKmsKeyArn");
var logsBucketName = CdkBridge.String(stack, "logsBucketName");

new S3LogStorage(stack, "LogStorage", new S3LogStorageProps
{
    Context = context,

    // KMS encryption
    SseAlgorithm = "aws:kms",
    KmsKeyArn = logKmsKeyArn,
    BucketKeyEnabled = true,

    // Access logs
    AccessLogBucketName = logsBucketName,
    AccessLogPrefix = "acme-dev-app-logs/",

    // SQS notifications
    NotificationsEnabled = true,
    NotificationsType = "SQS",
    NotificationsPrefix = "raw/",

    // Lifecycle rules
    LifecycleRules = new[]
    {
        new S3LifecycleRule
        {
            Id = "expire-old-logs",
            Enabled = true,
            ExpirationDays = 365,
            NoncurrentVersionExpirationDays = 30,
            Transitions = new[]
            {
                new S3LifecycleTransition
                {
                    StorageClass = "GLACIER",
                    TransitionAfterDays = 90,
                }
            },
            AbortIncompleteMultipartUploadAfterDays = 7,
        }
    },

    // Public access blocks
    BlockPublicAcls = true,
    BlockPublicPolicy = true,
    IgnorePublicAcls = true,
    RestrictPublicBuckets = true,

    // SSL and versioning
    AllowSslRequestsOnly = true,
    VersioningEnabled = true,
    ObjectOwnership = "ObjectWriter",
});

app.Synth();
