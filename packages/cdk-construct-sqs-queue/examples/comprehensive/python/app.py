import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns, ContextProps
from sevenpico.cdk_construct_sqs_queue import SqsQueue

app = cdk.App()
stack = cdk.Stack(app, "SqsQueueComprehensiveStack")

context = ContextFns.make(ContextProps(
    namespace="acme",
    environment="dev",
    stage="app",
    tags={"Owner": "platform-team", "CostCenter": "engineering"},
))

SqsQueue(stack, "Queue",
    context=context,
    visibility_timeout_seconds=300,
    message_retention_seconds=86400,
    dlq_enabled=True,
    sqs_managed_sse_enabled=True,
)

app.synth()
