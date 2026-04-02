import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns, ContextProps
from sevenpico.cdk_construct_dynamodb import Dynamodb

app = cdk.App()
stack = cdk.Stack(app, "DynamodbMinimalStack")

context = ContextFns.make(ContextProps(namespace="acme", environment="dev", stage="app"))

Dynamodb(stack, "Table", context=context, hash_key="id")

app.synth()
