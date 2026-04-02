import aws_cdk as cdk
from sevenpico.cdk_bridge import CdkBridge
from sevenpico.cdk_construct_express_sfn_error_notification import (
    ExpressSfnErrorNotification,
    ExpressSfnTarget,
)

app = cdk.App()
stack = cdk.Stack(app, "ExpressSfnErrorNotificationMultiTargetStack")

# Load context and platform references from CDK Bridge JSON.
context = CdkBridge.context(stack)
processor_arn = CdkBridge.string(stack, "processorArn")
validator_arn = CdkBridge.string(stack, "validatorArn")
alarms_sns_topic_arn = CdkBridge.string(stack, "alarmsSnsTopicArn")

ExpressSfnErrorNotification(stack, "ExpressSfnMonitor",
    context=context,
    step_functions={
        "processor": ExpressSfnTarget(arn=processor_arn),
        "validator": ExpressSfnTarget(arn=validator_arn),
    },
    rate_alarm_sns_topic_arn=alarms_sns_topic_arn,
    volume_alarm_sns_topic_arn=alarms_sns_topic_arn,
)

app.synth()
