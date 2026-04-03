import aws_cdk as cdk
from sevenpico.cdk_bridge import CdkBridge
from sevenpico.cdk_construct_lambda_error_notification import LambdaErrorNotification

app = cdk.App()
stack = cdk.Stack(app, "LambdaErrorNotificationMinimalStack")

# Load context and platform references from CDK Bridge JSON.
context = CdkBridge.context(stack)
lambda_arn = CdkBridge.string(stack, "lambdaArn")
lambda_function_name = CdkBridge.string(stack, "lambdaFunctionName")
lambda_role_name = CdkBridge.string(stack, "lambdaRoleName")
alarms_sns_topic_arn = CdkBridge.string(stack, "alarmsSnsTopicArn")

LambdaErrorNotification(stack, "LambdaMonitor",
    context=context,
    lambda_arn=lambda_arn,
    lambda_function_name=lambda_function_name,
    lambda_role_name=lambda_role_name,
    rate_alarm_sns_topic_arn=alarms_sns_topic_arn,
    volume_alarm_sns_topic_arn=alarms_sns_topic_arn,
)

app.synth()
