using Amazon.CDK;
using SevenPico.CdkBridge;
using SevenPico.CdkConstructLambdaErrorNotification;

var app = new App();
var stack = new Stack(app, "LambdaErrorNotificationMinimalStack");

// Load context and platform references from CDK Bridge JSON.
var context = CdkBridge.Context(stack);
var lambdaArn = CdkBridge.String(stack, "lambdaArn");
var lambdaFunctionName = CdkBridge.String(stack, "lambdaFunctionName");
var lambdaRoleName = CdkBridge.String(stack, "lambdaRoleName");
var alarmsSnsTopicArn = CdkBridge.String(stack, "alarmsSnsTopicArn");

new LambdaErrorNotification(stack, "LambdaMonitor", new LambdaErrorNotificationProps
{
    Context = context,
    LambdaArn = lambdaArn,
    LambdaFunctionName = lambdaFunctionName,
    LambdaRoleName = lambdaRoleName,
    RateAlarmSnsTopicArn = alarmsSnsTopicArn,
    VolumeAlarmSnsTopicArn = alarmsSnsTopicArn,
});

app.Synth();
