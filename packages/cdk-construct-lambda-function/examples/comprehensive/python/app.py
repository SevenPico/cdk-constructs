import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns, ContextProps
from sevenpico.cdk_construct_lambda_function import LambdaFunction, LambdaEnvironment

app = cdk.App()
stack = cdk.Stack(app, "LambdaFunctionComprehensiveStack")

context = ContextFns.make(ContextProps(
    namespace="acme",
    environment="dev",
    stage="app",
    tags={"Owner": "platform-team", "CostCenter": "engineering"},
))

LambdaFunction(stack, "Fn",
    context=context,
    runtime="nodejs20.x",
    handler="index.handler",
    s3_bucket="acme-dev-app-lambda-artifacts",
    s3_key="functions/my-function.zip",
    description="Acme data processing function",
    memory_size_mb=512,
    timeout_seconds=30,
    architecture="arm64",
    tracing_mode="Active",
    lambda_insights_enabled=True,
    cloudwatch_logs_retention_days=30,
    reserved_concurrent_executions=10,
    environment=LambdaEnvironment(variables={"LOG_LEVEL": "INFO", "STAGE": "dev"}),
    ssm_parameter_names=["/acme/dev/app/db-url"],
)

app.synth()
