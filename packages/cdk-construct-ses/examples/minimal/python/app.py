import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns, ContextProps
from sevenpico.cdk_construct_ses import Ses

app = cdk.App()
stack = cdk.Stack(app, "SesMinimalStack")

context = ContextFns.make(ContextProps(namespace="acme", environment="dev", stage="app"))

Ses(stack, "Ses", context=context)

app.synth()
