using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructSes;

var app = new App();
var stack = new Stack(app, "SesWithDkimStack");

var context = ContextFns.Make(new ContextProps { Namespace = "acme", Environment = "dev", Stage = "app" });

new Ses(stack, "Ses", new SesProps
{
    Context = context,
    VerifyDomain = true,
    VerifyDkim = true,
    ZoneId = "Z0PUBLICZONEID00000",
    ZoneName = "dev.acme.example.com",
});

app.Synth();
