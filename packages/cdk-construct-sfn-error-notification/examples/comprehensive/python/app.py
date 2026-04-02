import aws_cdk as cdk
from sevenpico.cdk_bridge import CdkBridge
from sevenpico.cdk_construct_sfn_error_notification import SfnErrorNotification

app = cdk.App()
stack = cdk.Stack(app, "SfnErrorNotificationComprehensiveStack")

# Load context and platform references from CDK Bridge JSON.
context = CdkBridge.context(stack)
state_machine_arn = CdkBridge.string(stack, "stateMachineArn")
alarms_sns_topic_arn = CdkBridge.string(stack, "alarmsSnsTopicArn")
kms_key_arn = CdkBridge.string(stack, "kmsKeyArn")

SfnErrorNotification(stack, "SfnMonitor",
    context=context,
    state_machine_arn=state_machine_arn,
    rate_alarm_sns_topic_arn=alarms_sns_topic_arn,
    volume_alarm_sns_topic_arn=alarms_sns_topic_arn,

    # KMS-encrypted DLQ
    sqs_kms_key_arn=kms_key_arn,
    sqs_queue_name="acme-dev-app-processor-dlq",
    sqs_message_retention_seconds=1209600,  # 14 days
    sqs_visibility_timeout_seconds=30,

    # Alarm tuning
    alarm_period_seconds=300,
    alarm_evaluation_periods=3,
    alarm_datapoints_to_alarm=2,
    rate_alarm_name="acme-dev-app-processor-error-rate",
    volume_alarm_name="acme-dev-app-processor-error-volume",

    # EventBridge Pipe tuning
    eventbridge_pipe_name="acme-dev-app-processor-replay",
    eventbridge_pipe_batch_size=5,
    eventbridge_pipe_log_level="INFO",
    cloudwatch_log_retention_days=30,
    target_step_function_input_template="<$.detail.input>",

    # EventBridge rule name
    eventbridge_rule_name="acme-dev-app-processor-failed",
)

app.synth()
