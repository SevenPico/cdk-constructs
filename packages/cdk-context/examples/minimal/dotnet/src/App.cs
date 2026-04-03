using Amazon.CDK;
using SevenPico.CdkContext;

var app = new App();
var stack = new Stack(app, "MinimalContextExample");

// Build a context with required props only: namespace, environment, stage.
var ctx = ContextFns.Make(new ContextProps
{
    Namespace = "acme",
    Environment = "dev",
    Stage = "app",
});

Console.WriteLine($"Context ID:   {ContextFns.Id(ctx)}");           // acme-dev-app
Console.WriteLine($"Is enabled:   {ContextFns.IsEnabled(ctx)}");    // True
Console.WriteLine($"Tags:         {string.Join(", ", ContextFns.Tags(ctx))}");

app.Synth();
