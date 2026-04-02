import aws_cdk as cdk
from sevenpico.cdk_bridge import CdkBridge
from sevenpico.cdk_construct_s3_bucket import S3Bucket

app = cdk.App()
stack = cdk.Stack(app, "S3BucketKmsEncryptedStack")

# Context and kmsKeyArn come from the bridge fixture (cdk.json sevenpico block)
context = CdkBridge.context(stack)
kms_key_arn = CdkBridge.string(stack, "kmsKeyArn")

# KMS-encrypted bucket — sseAlgorithm 'aws:kms' with a KMS key ARN from the bridge fixture.
# Creates a KMS grant resource in addition to the bucket.
S3Bucket(stack, "Bucket",
    context=context,
    sse_algorithm="aws:kms",
    kms_key_arn=kms_key_arn,
    bucket_key_enabled=True,
    allow_encrypted_uploads_only=True,
)

app.synth()
