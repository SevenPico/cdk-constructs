using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructSes;

var app = new App();
var stack = new Stack(app, "SesDisabledStack");

var context = ContextFns.Make(new ContextProps { Namespace = "acme", Environment = "dev", Stage = "app", Enabled = false });

new Ses(stack, "Ses", new SesProps
{
    Context = context,
});

app.Synth();
