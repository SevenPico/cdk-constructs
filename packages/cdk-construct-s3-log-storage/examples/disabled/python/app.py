import aws_cdk as cdk
from sevenpico.cdk_bridge import CdkBridge
from sevenpico.cdk_construct_s3_log_storage import S3LogStorage

app = cdk.App()
stack = cdk.Stack(app, "S3LogStorageDisabledStack")

# Load context from CDK Bridge JSON. The cdk.json sets enabled: false,
# so the construct will create no resources.
context = CdkBridge.context(stack)

storage = S3LogStorage(stack, "LogStorage",
    context=context,
)

# bucket and notification_queue are None when disabled.
print("bucket:", storage.bucket)               # None
print("queue:", storage.notification_queue)    # None

app.synth()
