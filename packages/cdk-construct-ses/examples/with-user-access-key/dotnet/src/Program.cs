using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructSes;

var app = new App();
var stack = new Stack(app, "SesWithUserAccessKeyStack");

var context = ContextFns.Make(new ContextProps { Namespace = "acme", Environment = "dev", Stage = "app" });

new Ses(stack, "Ses", new SesProps
{
    Context = context,
    SesUserEnabled = true,
    CreateIamAccessKey = true,
});

app.Synth();
