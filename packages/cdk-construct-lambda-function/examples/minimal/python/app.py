import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns, ContextProps
from sevenpico.cdk_construct_lambda_function import LambdaFunction

app = cdk.App()
stack = cdk.Stack(app, "LambdaFunctionMinimalStack")

context = ContextFns.make(ContextProps(namespace="acme", environment="dev", stage="app"))

LambdaFunction(stack, "Fn",
    context=context,
    runtime="nodejs20.x",
    handler="index.handler",
    s3_bucket="acme-dev-app-lambda-artifacts",
    s3_key="functions/my-function.zip",
)

app.synth()
