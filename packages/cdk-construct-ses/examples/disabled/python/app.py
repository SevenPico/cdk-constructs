import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns, ContextProps
from sevenpico.cdk_construct_ses import Ses

app = cdk.App()
stack = cdk.Stack(app, "SesDisabledStack")

context = ContextFns.make(ContextProps(namespace="acme", environment="dev", stage="app", enabled=False))

Ses(stack, "Ses", context=context)

app.synth()
