import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns, ContextProps
from sevenpico.cdk_construct_eventbridge_rule import EventbridgeRule

app = cdk.App()
stack = cdk.Stack(app, "EventbridgeRuleDisabledStack")

context = ContextFns.make(ContextProps(namespace="acme", environment="dev", stage="app", enabled=False))

EventbridgeRule(stack, "Rule",
    context=context,
    event_pattern={"source": ["acme.app"]},
    target_arn="arn:aws:sqs:us-east-1:123456789012:acme-dev-app",
)

app.synth()
