using Amazon.CDK;
using SevenPico.CdkBridge;
using SevenPico.CdkConstructSfnErrorNotification;

var app = new App();
var stack = new Stack(app, "SfnErrorNotificationComprehensiveStack");

// Load context and platform references from CDK Bridge JSON.
var context = CdkBridge.Context(stack);
var stateMachineArn = CdkBridge.String(stack, "stateMachineArn");
var alarmsSnsTopicArn = CdkBridge.String(stack, "alarmsSnsTopicArn");
var kmsKeyArn = CdkBridge.String(stack, "kmsKeyArn");

new SfnErrorNotification(stack, "SfnMonitor", new SfnErrorNotificationProps
{
    Context = context,
    StateMachineArn = stateMachineArn,
    RateAlarmSnsTopicArn = alarmsSnsTopicArn,
    VolumeAlarmSnsTopicArn = alarmsSnsTopicArn,

    // KMS-encrypted DLQ
    SqsKmsKeyArn = kmsKeyArn,
    SqsQueueName = "acme-dev-app-processor-dlq",
    SqsMessageRetentionSeconds = 1209600,
    SqsVisibilityTimeoutSeconds = 30,

    // Alarm tuning
    AlarmPeriodSeconds = 300,
    AlarmEvaluationPeriods = 3,
    AlarmDatapointsToAlarm = 2,
    RateAlarmName = "acme-dev-app-processor-error-rate",
    VolumeAlarmName = "acme-dev-app-processor-error-volume",

    // EventBridge Pipe tuning
    EventbridgePipeName = "acme-dev-app-processor-replay",
    EventbridgePipeBatchSize = 5,
    EventbridgePipeLogLevel = "INFO",
    CloudwatchLogRetentionDays = 30,
    TargetStepFunctionInputTemplate = "<$.detail.input>",

    // EventBridge rule name
    EventbridgeRuleName = "acme-dev-app-processor-failed",
});

app.Synth();
