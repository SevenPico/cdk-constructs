using Amazon.CDK;
using SevenPico.CdkBridge;
using SevenPico.CdkConstructSfnErrorNotification;

var app = new App();
var stack = new Stack(app, "SfnErrorNotificationMinimalStack");

// Load context and platform references from CDK Bridge JSON.
var context = CdkBridge.Context(stack);
var stateMachineArn = CdkBridge.String(stack, "stateMachineArn");
var alarmsSnsTopicArn = CdkBridge.String(stack, "alarmsSnsTopicArn");

new SfnErrorNotification(stack, "SfnMonitor", new SfnErrorNotificationProps
{
    Context = context,
    StateMachineArn = stateMachineArn,
    RateAlarmSnsTopicArn = alarmsSnsTopicArn,
    VolumeAlarmSnsTopicArn = alarmsSnsTopicArn,
});

app.Synth();
