using System.Collections.Generic;
using Amazon.CDK;
using SevenPico.CdkBridge;
using SevenPico.CdkConstructExpressSfnErrorNotification;

var app = new App();
var stack = new Stack(app, "ExpressSfnErrorNotificationComprehensiveStack");

// Load context and platform references from CDK Bridge JSON.
var context = CdkBridge.Context(stack);
var processorArn = CdkBridge.String(stack, "processorArn");
var alarmsSnsTopicArn = CdkBridge.String(stack, "alarmsSnsTopicArn");
var kmsKeyArn = CdkBridge.String(stack, "kmsKeyArn");
var kmsKeyId = CdkBridge.String(stack, "kmsKeyId");

new ExpressSfnErrorNotification(stack, "ExpressSfnMonitor", new ExpressSfnErrorNotificationProps
{
    Context = context,
    StepFunctions = new Dictionary<string, IExpressSfnTarget>
    {
        ["processor"] = new ExpressSfnTarget
        {
            Arn = processorArn,
            SqsQueueName = "acme-dev-app-processor-dlq",
            RateAlarmName = "acme-dev-app-processor-error-rate",
            VolumeAlarmName = "acme-dev-app-processor-error-volume",
        },
    },
    RateAlarmSnsTopicArn = alarmsSnsTopicArn,
    VolumeAlarmSnsTopicArn = alarmsSnsTopicArn,

    // KMS-encrypted DLQs
    SqsKmsConfig = new SqsKmsConfig { KeyId = kmsKeyId, KeyArn = kmsKeyArn },
    SqsMessageRetentionSeconds = 1209600,
    SqsVisibilityTimeoutSeconds = 60,

    // Alarm tuning
    AlarmPeriodSeconds = 300,
    AlarmEvaluationPeriods = 3,
    AlarmDatapointsToAlarm = 2,

    // EventBridge Pipe tuning
    EventbridgePipeBatchSize = 5,
    EventbridgePipeLogLevel = "INFO",
    CloudwatchLogRetentionDays = 30,
    TargetStepFunctionInputTemplate = "<$.detail.input>",
});

app.Synth();
