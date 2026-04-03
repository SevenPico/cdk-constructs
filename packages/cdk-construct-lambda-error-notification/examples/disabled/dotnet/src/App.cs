using Amazon.CDK;
using SevenPico.CdkBridge;
using SevenPico.CdkConstructLambdaErrorNotification;

var app = new App();
var stack = new Stack(app, "LambdaErrorNotificationDisabledStack");

// Load context from CDK Bridge JSON. The cdk.json sets enabled: false,
// so the construct will create no resources.
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
