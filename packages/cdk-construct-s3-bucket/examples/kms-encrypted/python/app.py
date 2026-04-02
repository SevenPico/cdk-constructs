import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns, ContextProps
from sevenpico.cdk_construct_s3_bucket import S3Bucket

app = cdk.App()
stack = cdk.Stack(app, "S3BucketKmsEncryptedStack")

context = ContextFns.make(ContextProps(
    namespace="acme",
    environment="dev",
    stage="app",
    tags={"Owner": "platform-team", "CostCenter": "engineering"},
))

# KMS-encrypted bucket — sseAlgorithm 'aws:kms' with a KMS key ARN.
# Creates a KMS grant resource in addition to the bucket.
S3Bucket(stack, "Bucket",
    context=context,
    sse_algorithm="aws:kms",
    kms_key_arn="arn:aws:kms:us-east-1:123456789012:key/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    bucket_key_enabled=True,
    allow_encrypted_uploads_only=True,
)

app.synth()
