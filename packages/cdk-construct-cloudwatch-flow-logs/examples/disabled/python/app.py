import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns, ContextProps
from sevenpico.cdk_construct_cloudwatch_flow_logs import CloudwatchFlowLogs

app = cdk.App()
stack = cdk.Stack(app, "CloudwatchFlowLogsDisabledStack")

context = ContextFns.make(ContextProps(namespace="acme", environment="dev", stage="app", enabled=False))

CloudwatchFlowLogs(stack, "FlowLogs",
    context=context,
    vpc_id="vpc-0123456789abcdef0",
)

app.synth()
