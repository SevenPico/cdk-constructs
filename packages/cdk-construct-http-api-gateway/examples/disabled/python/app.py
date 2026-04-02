import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns, ContextProps
from sevenpico.cdk_construct_http_api_gateway import HttpApiGateway

app = cdk.App()
stack = cdk.Stack(app, "HttpApiGatewayDisabledStack")

context = ContextFns.make(ContextProps(namespace="acme", environment="dev", stage="app", enabled=False))

HttpApiGateway(stack, "Api", context=context)

app.synth()
