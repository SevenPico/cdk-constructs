using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructEventbridge;

var app = new App();
var stack = new Stack(app, "EventbridgeMinimalStack");

var context = ContextFns.Make(new ContextProps { Namespace = "acme", Environment = "dev", Stage = "app" });

new Eventbridge(stack, "Bus", new EventbridgeProps
{
    Context = context,
});

app.Synth();
