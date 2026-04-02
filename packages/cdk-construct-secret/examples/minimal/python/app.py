import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns, ContextProps
from sevenpico.cdk_construct_secret import Secret, SecretProps

app = cdk.App()
stack = cdk.Stack(app, "SecretMinimalStack")

context = ContextFns.make(ContextProps(namespace="acme", environment="dev", stage="app"))

# Minimal Secret — all defaults: KMS key auto-created, no SNS
Secret(stack, "Secret", SecretProps(context=context))

app.synth()
