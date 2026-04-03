using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructSes;

var app = new App();
var stack = new Stack(app, "SesWithIamGroupStack");

var context = ContextFns.Make(new ContextProps { Namespace = "acme", Environment = "dev", Stage = "app" });

new Ses(stack, "Ses", new SesProps
{
    Context = context,
    SesGroupEnabled = true,
    SesGroupName = "ses-senders",
});

app.Synth();
