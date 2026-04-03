import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns, ContextProps
from sevenpico.cdk_construct_s3_bucket import S3Bucket, S3LifecycleRule, S3LifecycleTransition, S3CorsRule

app = cdk.App()
stack = cdk.Stack(app, "S3BucketComprehensiveStack")

context = ContextFns.make(ContextProps(
    namespace="acme",
    environment="dev",
    stage="app",
    tags={"Owner": "platform-team", "CostCenter": "engineering"},
))

S3Bucket(stack, "Bucket",
    context=context,
    versioning_enabled=True,
    transfer_acceleration_enabled=True,
    object_ownership="BucketOwnerEnforced",
    allow_ssl_requests_only=True,
    lifecycle_rules=[
        S3LifecycleRule(
            id="expire-old-versions",
            enabled=True,
            noncurrent_version_expiration_days=30,
            transitions=[
                S3LifecycleTransition(storage_class="STANDARD_IA", transition_after_days=90),
                S3LifecycleTransition(storage_class="GLACIER", transition_after_days=365),
            ],
            abort_incomplete_multipart_upload_after_days=7,
        ),
    ],
    cors_rules=[
        S3CorsRule(
            allowed_methods=["GET", "PUT"],
            allowed_origins=["https://acme.example.com"],
            allowed_headers=["*"],
            max_age=3600,
        ),
    ],
)

app.synth()
