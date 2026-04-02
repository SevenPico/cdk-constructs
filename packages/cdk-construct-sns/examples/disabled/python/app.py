import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns, ContextProps
from sevenpico.cdk_construct_sns import Sns

app = cdk.App()
stack = cdk.Stack(app, "SnsDisabledStack")

context = ContextFns.make(ContextProps(namespace="acme", environment="dev", stage="app", enabled=False))

Sns(stack, "Topic", context=context)

app.synth()
