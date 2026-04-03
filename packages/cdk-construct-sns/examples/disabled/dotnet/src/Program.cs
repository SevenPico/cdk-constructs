using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructSns;

var app = new App();
var stack = new Stack(app, "SnsDisabledStack");

var context = ContextFns.Make(new ContextProps { Namespace = "acme", Environment = "dev", Stage = "app", Enabled = false });

new Sns(stack, "Topic", new SnsProps
{
    Context = context,
});

app.Synth();
