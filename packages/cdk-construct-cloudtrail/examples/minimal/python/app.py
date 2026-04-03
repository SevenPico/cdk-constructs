import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns, ContextProps
from sevenpico.cdk_construct_cloudtrail import CloudTrail

app = cdk.App()
stack = cdk.Stack(app, "CloudtrailMinimalStack")

context = ContextFns.make(ContextProps(namespace="acme", environment="dev", stage="app"))

CloudTrail(stack, "Trail", context=context, s3_bucket_name="my-cloudtrail-logs-bucket")

app.synth()
