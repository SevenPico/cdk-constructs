using Amazon.CDK;
using SevenPico.CdkBridge;

var app = new App();
var stack = new Stack(app, "BasicBridgeExample");

// Read Context labels from the bridge fixture.
var ctx = CdkBridge.Context(stack);
Console.WriteLine($"Context ID:   {ctx.Id}");       // acme-dev-app
Console.WriteLine($"Is enabled:   {ctx.Enabled}");  // True

// Read a single Platform output — vpcId — as a string.
var vpcId = CdkBridge.String(stack, "vpcId");
Console.WriteLine($"VPC ID:       {vpcId}");

new CfnOutput(stack, "ContextId", new CfnOutputProps { Value = ctx.Id });
new CfnOutput(stack, "VpcId",     new CfnOutputProps { Value = vpcId });

app.Synth();
