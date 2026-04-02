using Amazon.CDK;
using SevenPico.CdkContext;

var app = new App();
var stack = new Stack(app, "DisabledContextExample");

// Build a disabled context.
var ctx = ContextFns.Make(new ContextProps
{
    Namespace = "acme",
    Environment = "dev",
    Stage = "app",
    Enabled = false,
});

Console.WriteLine($"Context ID:   {ContextFns.Id(ctx)}");
Console.WriteLine($"Is enabled:   {ContextFns.IsEnabled(ctx)}");  // False

// Extending a disabled context keeps Enabled=false — the disabled flag is sticky.
var childCtx = ContextFns.Extend(ctx, new ContextProps
{
    Attributes = new[] { "worker" },
    Enabled = true,
});
Console.WriteLine($"Child enabled: {ContextFns.IsEnabled(childCtx)}");  // still False

app.Synth();
