using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructHttpApiGateway;

var app = new App();
var stack = new Stack(app, "HttpApiGatewayDisabledStack");

var context = ContextFns.Make(new ContextProps { Namespace = "acme", Environment = "dev", Stage = "app", Enabled = false });

new HttpApiGateway(stack, "Api", new HttpApiGatewayProps
{
    Context = context,
});

app.Synth();
