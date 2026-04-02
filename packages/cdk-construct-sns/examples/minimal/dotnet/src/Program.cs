using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructSns;

var app = new App();
var stack = new Stack(app, "SnsMinimalStack");

var context = ContextFns.Make(new ContextProps { Namespace = "acme", Environment = "dev", Stage = "app" });

new Sns(stack, "Topic", new SnsProps
{
    Context = context,
});

app.Synth();
