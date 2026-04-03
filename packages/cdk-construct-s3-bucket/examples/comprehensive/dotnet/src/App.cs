using System.Collections.Generic;
using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructS3Bucket;

var app = new App();
var stack = new Stack(app, "S3BucketComprehensiveStack");

var context = ContextFns.Make(new ContextProps { Namespace = "acme", Environment = "dev", Stage = "app" });

new S3Bucket(stack, "Bucket", new S3BucketProps
{
    Context = context,
    VersioningEnabled = true,
    TransferAccelerationEnabled = true,
    ObjectOwnership = "BucketOwnerEnforced",
    AllowSslRequestsOnly = true,
    LifecycleRules = new[]
    {
        new S3LifecycleRule
        {
            Id = "expire-old-versions",
            Enabled = true,
            NoncurrentVersionExpirationDays = 30,
            Transitions = new[]
            {
                new S3LifecycleTransition { StorageClass = "STANDARD_IA", TransitionAfterDays = 90 },
                new S3LifecycleTransition { StorageClass = "GLACIER", TransitionAfterDays = 365 },
            },
            AbortIncompleteMultipartUploadAfterDays = 7,
        },
    },
    CorsRules = new[]
    {
        new S3CorsRule
        {
            AllowedMethods = new[] { "GET", "PUT" },
            AllowedOrigins = new[] { "https://acme.example.com" },
            AllowedHeaders = new[] { "*" },
            MaxAge = 3600,
        },
    },
});

app.Synth();
