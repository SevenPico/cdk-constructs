import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns, ContextProps
from sevenpico.cdk_construct_kinesis_stream import KinesisStream

app = cdk.App()
stack = cdk.Stack(app, "KinesisStreamMinimalStack")

context = ContextFns.make(ContextProps(namespace="acme", environment="dev", stage="app"))

KinesisStream(stack, "Stream", context=context)

app.synth()
