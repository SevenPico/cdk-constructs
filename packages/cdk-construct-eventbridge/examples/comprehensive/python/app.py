import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns, ContextProps
from sevenpico.cdk_construct_eventbridge import Eventbridge

app = cdk.App()
stack = cdk.Stack(app, "EventbridgeComprehensiveStack")

context = ContextFns.make(ContextProps(
    namespace="acme",
    environment="dev",
    stage="app",
    tags={"Owner": "platform-team", "CostCenter": "engineering"},
))

Eventbridge(stack, "Bus",
    context=context,
    event_bus_name="acme-dev-app-events",
)

app.synth()
