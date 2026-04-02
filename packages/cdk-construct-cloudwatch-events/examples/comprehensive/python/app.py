import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns, ContextProps
from sevenpico.cdk_construct_cloudwatch_events import CloudwatchEvents, CloudwatchEventRule, CloudwatchEventTarget

app = cdk.App()
stack = cdk.Stack(app, "CloudwatchEventsComprehensiveStack")

context = ContextFns.make(ContextProps(namespace="acme", environment="dev", stage="app"))

CloudwatchEvents(
    stack,
    "Events",
    context=context,
    rules=[
        CloudwatchEventRule(
            name="heartbeat",
            description="Scheduled heartbeat every 5 minutes",
            schedule="rate(5 minutes)",
            targets=[
                CloudwatchEventTarget(
                    type="sns",
                    arn="arn:aws:sns:us-east-1:123456789012:my-topic",
                )
            ],
        ),
        CloudwatchEventRule(
            name="ec2-state-change",
            description="Reacts to EC2 instance state changes",
            event_pattern='{"source":["aws.ec2"],"detail-type":["EC2 Instance State-change Notification"]}',
            targets=[
                CloudwatchEventTarget(
                    type="sqs",
                    arn="arn:aws:sqs:us-east-1:123456789012:my-queue",
                )
            ],
        ),
    ],
)

app.synth()
