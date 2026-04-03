import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns, ContextProps
from sevenpico.cdk_construct_http_api_gateway import (
    HttpApiGateway,
    HttpApiCorsConfig,
    HttpApiIntegration,
    HttpApiRoute,
)

app = cdk.App()
stack = cdk.Stack(app, "HttpApiGatewayComprehensiveStack")

context = ContextFns.make(ContextProps(
    namespace="acme",
    environment="dev",
    stage="app",
    tags={"Owner": "platform-team", "CostCenter": "engineering"},
))

HttpApiGateway(stack, "Api",
    context=context,
    description="Acme HTTP API",
    enable_auto_deploy=True,
    cloudwatch_logs_retention_days=30,
    cors_configuration=HttpApiCorsConfig(
        allow_origins=["https://acme.example.com"],
        allow_methods=["GET", "POST", "PUT", "DELETE"],
        allow_headers=["Content-Type", "Authorization"],
        max_age=300,
    ),
    integrations={
        "lambda": HttpApiIntegration(
            type="AWS_PROXY",
            uri="arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:123456789012:function:acme-dev-app/invocations",
            payload_format_version="2.0",
        ),
    },
    routes={
        "getItems": HttpApiRoute(route_key="GET /items", integration_key="lambda", operation_name="GetItems"),
        "postItem": HttpApiRoute(route_key="POST /items", integration_key="lambda", operation_name="PostItem"),
    },
    stage_variables={"env": "dev"},
)

app.synth()
