import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns, ContextProps
from sevenpico.cdk_construct_secret import Secret, SecretProps

app = cdk.App()
stack = cdk.Stack(app, "SecretDisabledStack")

# enabled=False — construct creates no resources
context = ContextFns.make(ContextProps(namespace="acme", environment="dev", stage="app", enabled=False))

Secret(stack, "Secret", SecretProps(context=context))

app.synth()
