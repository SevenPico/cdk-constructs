import aws_cdk as cdk
from sevenpico.cdk_bridge import CdkBridge
from sevenpico.cdk_construct_s3_log_storage import S3LogStorage, S3LifecycleRule, S3LifecycleTransition

app = cdk.App()
stack = cdk.Stack(app, "S3LogStorageComprehensiveStack")

# Load context and platform references from CDK Bridge JSON.
context = CdkBridge.context(stack)
log_kms_key_arn = CdkBridge.string(stack, "logKmsKeyArn")
logs_bucket_name = CdkBridge.string(stack, "logsBucketName")

S3LogStorage(stack, "LogStorage",
    context=context,

    # KMS encryption
    sse_algorithm="aws:kms",
    kms_key_arn=log_kms_key_arn,
    bucket_key_enabled=True,

    # Access logs
    access_log_bucket_name=logs_bucket_name,
    access_log_prefix="acme-dev-app-logs/",

    # SQS notifications
    notifications_enabled=True,
    notifications_type="SQS",
    notifications_prefix="raw/",

    # Lifecycle rules
    lifecycle_rules=[
        S3LifecycleRule(
            id="expire-old-logs",
            enabled=True,
            expiration_days=365,
            noncurrent_version_expiration_days=30,
            transitions=[
                S3LifecycleTransition(
                    storage_class="GLACIER",
                    transition_after_days=90,
                )
            ],
            abort_incomplete_multipart_upload_after_days=7,
        )
    ],

    # Public access blocks
    block_public_acls=True,
    block_public_policy=True,
    ignore_public_acls=True,
    restrict_public_buckets=True,

    # SSL-only and versioning
    allow_ssl_requests_only=True,
    versioning_enabled=True,
    object_ownership="ObjectWriter",
)

app.synth()
