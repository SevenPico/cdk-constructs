import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns, ContextProps
from sevenpico.cdk_construct_cloudwatch_events import CloudwatchEvents, CloudwatchEventRule, CloudwatchEventTarget

app = cdk.App()
stack = cdk.Stack(app, "CloudwatchEventsMinimalStack")

context = ContextFns.make(ContextProps(namespace="acme", environment="dev", stage="app"))

CloudwatchEvents(
    stack,
    "Events",
    context=context,
    rules=[
        CloudwatchEventRule(
            name="heartbeat",
            schedule="rate(5 minutes)",
            targets=[
                CloudwatchEventTarget(
                    type="sns",
                    arn="arn:aws:sns:us-east-1:123456789012:my-topic",
                )
            ],
        )
    ],
)

app.synth()
