import aws_cdk as cdk
from sevenpico.cdk_bridge import CdkBridge
from sevenpico.cdk_construct_express_sfn_error_notification import (
    ExpressSfnErrorNotification,
    ExpressSfnTarget,
    SqsKmsConfig,
)

app = cdk.App()
stack = cdk.Stack(app, "ExpressSfnErrorNotificationComprehensiveStack")

# Load context and platform references from CDK Bridge JSON.
context = CdkBridge.context(stack)
processor_arn = CdkBridge.string(stack, "processorArn")
alarms_sns_topic_arn = CdkBridge.string(stack, "alarmsSnsTopicArn")
kms_key_arn = CdkBridge.string(stack, "kmsKeyArn")
kms_key_id = CdkBridge.string(stack, "kmsKeyId")

ExpressSfnErrorNotification(stack, "ExpressSfnMonitor",
    context=context,
    step_functions={
        "processor": ExpressSfnTarget(
            arn=processor_arn,
            sqs_queue_name="acme-dev-app-processor-dlq",
            rate_alarm_name="acme-dev-app-processor-error-rate",
            volume_alarm_name="acme-dev-app-processor-error-volume",
        ),
    },
    rate_alarm_sns_topic_arn=alarms_sns_topic_arn,
    volume_alarm_sns_topic_arn=alarms_sns_topic_arn,

    # KMS-encrypted DLQs
    sqs_kms_config=SqsKmsConfig(key_id=kms_key_id, key_arn=kms_key_arn),
    sqs_message_retention_seconds=1209600,  # 14 days
    sqs_visibility_timeout_seconds=60,

    # Alarm tuning
    alarm_period_seconds=300,
    alarm_evaluation_periods=3,
    alarm_datapoints_to_alarm=2,

    # EventBridge Pipe tuning
    eventbridge_pipe_batch_size=5,
    eventbridge_pipe_log_level="INFO",
    cloudwatch_log_retention_days=30,
    target_step_function_input_template="<$.detail.input>",
)

app.synth()
