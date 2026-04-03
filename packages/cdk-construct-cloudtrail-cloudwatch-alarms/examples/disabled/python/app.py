import aws_cdk as cdk
from sevenpico.cdk_context import ContextFns, ContextProps
from sevenpico.cdk_construct_cloudtrail_cloudwatch_alarms import CloudtrailCloudwatchAlarms

app = cdk.App()
stack = cdk.Stack(app, "CloudtrailCloudwatchAlarmsDisabledStack")

context = ContextFns.make(ContextProps(namespace="acme", environment="dev", stage="app", enabled=False))

CloudtrailCloudwatchAlarms(stack, "Alarms",
    context=context,
    log_group_name="/aws/cloudtrail/acme-dev-app",
    sns_topic_arn="arn:aws:sns:us-east-1:123456789012:acme-dev-app-alerts",
)

app.synth()
