import aws_cdk as cdk
from sevenpico.cdk_bridge import CdkBridge
from sevenpico.cdk_construct_s3_log_storage import S3LogStorage

app = cdk.App()
stack = cdk.Stack(app, "S3LogStorageMinimalStack")

# Load context from CDK Bridge JSON (sevenpico key in cdk.json context).
context = CdkBridge.context(stack)

S3LogStorage(stack, "LogStorage",
    context=context,
)

app.synth()
