import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns, ContextProps
from sevenpico.cdk_construct_eventbridge_rule import EventbridgeRule

app = cdk.App()
stack = cdk.Stack(app, "EventbridgeRuleComprehensiveStack")

context = ContextFns.make(ContextProps(
    namespace="acme",
    environment="dev",
    stage="app",
    tags={"Owner": "platform-team", "CostCenter": "engineering"},
))

EventbridgeRule(stack, "Rule",
    context=context,
    description="Route acme.app order events to processing queue",
    event_pattern={
        "source": ["acme.app"],
        "detail-type": ["OrderPlaced"],
    },
    target_arn="arn:aws:sqs:us-east-1:123456789012:acme-dev-app-orders",
    rule_enabled=True,
    source_event_bus_name="acme-dev-app-events",
)

app.synth()
