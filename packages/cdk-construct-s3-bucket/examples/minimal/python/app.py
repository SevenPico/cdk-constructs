import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns, ContextProps
from sevenpico.cdk_construct_s3_bucket import S3Bucket

app = cdk.App()
stack = cdk.Stack(app, "S3BucketMinimalStack")

context = ContextFns.make(ContextProps(namespace="acme", environment="dev", stage="app"))

S3Bucket(stack, "Bucket", context=context)

app.synth()
