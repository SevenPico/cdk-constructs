using System.Collections.Generic;
using Amazon.CDK;
using SevenPico.CdkBridge;
using SevenPico.CdkConstructExpressSfnErrorNotification;

var app = new App();
var stack = new Stack(app, "ExpressSfnErrorNotificationMinimalStack");

// Load context and platform references from CDK Bridge JSON.
var context = CdkBridge.Context(stack);
var processorArn = CdkBridge.String(stack, "processorArn");
var alarmsSnsTopicArn = CdkBridge.String(stack, "alarmsSnsTopicArn");

new ExpressSfnErrorNotification(stack, "ExpressSfnMonitor", new ExpressSfnErrorNotificationProps
{
    Context = context,
    StepFunctions = new Dictionary<string, IExpressSfnTarget>
    {
        ["processor"] = new ExpressSfnTarget { Arn = processorArn },
    },
    RateAlarmSnsTopicArn = alarmsSnsTopicArn,
    VolumeAlarmSnsTopicArn = alarmsSnsTopicArn,
});

app.Synth();
