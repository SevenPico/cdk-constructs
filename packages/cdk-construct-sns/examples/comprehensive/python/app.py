import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns, ContextProps
from sevenpico.cdk_construct_sns import Sns

app = cdk.App()
stack = cdk.Stack(app, "SnsComprehensiveStack")

context = ContextFns.make(ContextProps(namespace="acme", environment="dev", stage="app"))

Sns(
    stack,
    "Topic",
    context=context,
    encryption_enabled=True,
    allowed_aws_services_for_publish=["events.amazonaws.com"],
    sqs_dlq_enabled=True,
)

app.synth()
