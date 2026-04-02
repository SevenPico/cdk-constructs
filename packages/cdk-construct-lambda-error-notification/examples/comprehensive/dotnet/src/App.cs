using Amazon.CDK;
using SevenPico.CdkBridge;
using SevenPico.CdkConstructLambdaErrorNotification;

var app = new App();
var stack = new Stack(app, "LambdaErrorNotificationComprehensiveStack");

// Load context and platform references from CDK Bridge JSON.
var context = CdkBridge.Context(stack);
var lambdaArn = CdkBridge.String(stack, "lambdaArn");
var lambdaFunctionName = CdkBridge.String(stack, "lambdaFunctionName");
var lambdaRoleName = CdkBridge.String(stack, "lambdaRoleName");
var alarmsSnsTopicArn = CdkBridge.String(stack, "alarmsSnsTopicArn");
var kmsKeyArn = CdkBridge.String(stack, "kmsKeyArn");
var kmsKeyId = CdkBridge.String(stack, "kmsKeyId");

new LambdaErrorNotification(stack, "LambdaMonitor", new LambdaErrorNotificationProps
{
    Context = context,
    LambdaArn = lambdaArn,
    LambdaFunctionName = lambdaFunctionName,
    LambdaRoleName = lambdaRoleName,
    RateAlarmSnsTopicArn = alarmsSnsTopicArn,
    VolumeAlarmSnsTopicArn = alarmsSnsTopicArn,

    // KMS-encrypted DLQ
    SqsKmsConfig = new SqsKmsConfig { KeyId = kmsKeyId, KeyArn = kmsKeyArn },
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
    TargetLambdaInputTemplate = "<$.requestPayload>",
});

app.Synth();
