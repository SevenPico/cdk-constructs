import aws_cdk as cdk
from sevenpico.cdk_bridge import CdkBridge
from sevenpico.cdk_construct_sfn_error_notification import SfnErrorNotification

app = cdk.App()
stack = cdk.Stack(app, "SfnErrorNotificationMinimalStack")

# Load context and platform references from CDK Bridge JSON.
context = CdkBridge.context(stack)
state_machine_arn = CdkBridge.string(stack, "stateMachineArn")
alarms_sns_topic_arn = CdkBridge.string(stack, "alarmsSnsTopicArn")

SfnErrorNotification(stack, "SfnMonitor",
    context=context,
    state_machine_arn=state_machine_arn,
    rate_alarm_sns_topic_arn=alarms_sns_topic_arn,
    volume_alarm_sns_topic_arn=alarms_sns_topic_arn,
)

app.synth()
