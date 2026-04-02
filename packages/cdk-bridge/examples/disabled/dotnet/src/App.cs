using Amazon.CDK;
using SevenPico.CdkBridge;

var app = new App();
var stack = new Stack(app, "DisabledBridgeExample");

// Read Context from bridge fixture — Enabled:false is set in the fixture.
var ctx = CdkBridge.Context(stack);
Console.WriteLine($"Context ID:   {ctx.Id}");
Console.WriteLine($"Is enabled:   {ctx.Enabled}");  // False

// Guard: skip resource creation when context is disabled.
if (!ctx.Enabled)
{
    Console.WriteLine("Context is disabled — skipping resource creation.");
}
else
{
    var vpcId = CdkBridge.String(stack, "vpcId");
    Console.WriteLine($"VPC ID:       {vpcId}");
}

app.Synth();
