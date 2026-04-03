import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns, ContextProps
from sevenpico.cdk_construct_kinesis_stream import KinesisStream

app = cdk.App()
stack = cdk.Stack(app, "KinesisStreamComprehensiveStack")

context = ContextFns.make(ContextProps(namespace="acme", environment="dev", stage="app"))

KinesisStream(
    stack,
    "Stream",
    context=context,
    shard_count=2,
    retention_period_hours=48,
    stream_mode="PROVISIONED",
    encryption_type="KMS",
    consumer_count=1,
)

app.synth()
