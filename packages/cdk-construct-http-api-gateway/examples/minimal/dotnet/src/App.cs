using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructHttpApiGateway;

var app = new App();
var stack = new Stack(app, "HttpApiGatewayMinimalStack");

var context = ContextFns.Make(new ContextProps { Namespace = "acme", Environment = "dev", Stage = "app" });

new HttpApiGateway(stack, "Api", new HttpApiGatewayProps
{
    Context = context,
});

app.Synth();
