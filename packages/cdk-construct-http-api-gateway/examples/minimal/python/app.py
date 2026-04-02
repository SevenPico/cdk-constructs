import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns, ContextProps
from sevenpico.cdk_construct_http_api_gateway import HttpApiGateway

app = cdk.App()
stack = cdk.Stack(app, "HttpApiGatewayMinimalStack")

context = ContextFns.make(ContextProps(namespace="acme", environment="dev", stage="app"))

HttpApiGateway(stack, "Api", context=context)

app.synth()
