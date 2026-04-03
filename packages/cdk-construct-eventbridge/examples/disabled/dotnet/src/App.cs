using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructEventbridge;

var app = new App();
var stack = new Stack(app, "EventbridgeDisabledStack");

var context = ContextFns.Make(new ContextProps
{
    Namespace = "acme",
    Environment = "dev",
    Stage = "app",
    Enabled = false,
});

new Eventbridge(stack, "Bus", new EventbridgeProps
{
    Context = context,
});

app.Synth();
