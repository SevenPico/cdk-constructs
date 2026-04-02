import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns, ContextProps
from sevenpico.cdk_construct_kms_key import KmsKey

app = cdk.App()
stack = cdk.Stack(app, "KmsKeyMinimalStack")

context = ContextFns.make(ContextProps(namespace="acme", environment="dev", stage="app"))

KmsKey(stack, "Key", context=context)

app.synth()
