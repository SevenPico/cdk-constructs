import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns, ContextProps
from sevenpico.cdk_construct_s3_bucket import S3Bucket

app = cdk.App()
stack = cdk.Stack(app, "S3BucketS3ManagedEncryptedStack")

context = ContextFns.make(ContextProps(
    namespace="acme",
    environment="dev",
    stage="app",
    tags={"Owner": "platform-team", "CostCenter": "engineering"},
))

# S3-managed encryption — AES256 (default). No KMS key needed.
# This is the same as the minimal scenario but makes the encryption explicit.
S3Bucket(stack, "Bucket",
    context=context,
    sse_algorithm="AES256",
)

app.synth()
