using Amazon.CDK;
using SevenPico.CdkBridge;
using SevenPico.CdkConstructSfnErrorNotification;

var app = new App();
var stack = new Stack(app, "SfnErrorNotificationDisabledStack");

// Load context with enabled: false — construct will create zero resources.
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
