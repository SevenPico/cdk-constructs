import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns, ContextProps
from sevenpico.cdk_construct_eventbridge import Eventbridge

app = cdk.App()
stack = cdk.Stack(app, "EventbridgeMinimalStack")

context = ContextFns.make(ContextProps(namespace="acme", environment="dev", stage="app"))

Eventbridge(stack, "Bus", context=context)

app.synth()
