using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructEventbridge;

var app = new App();
var stack = new Stack(app, "EventbridgeComprehensiveStack");

var context = ContextFns.Make(new ContextProps
{
    Namespace = "acme",
    Environment = "dev",
    Stage = "app",
    Tags = new System.Collections.Generic.Dictionary<string, string>
    {
        { "Owner", "platform-team" },
        { "CostCenter", "engineering" },
    },
});

new Eventbridge(stack, "Bus", new EventbridgeProps
{
    Context = context,
    EventBusName = "acme-dev-app-events",
});

app.Synth();
