using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructLambdaFunction;

var app = new App();
var stack = new Stack(app, "LambdaFunctionDisabledStack");

var context = ContextFns.Make(new ContextProps { Namespace = "acme", Environment = "dev", Stage = "app", Enabled = false });

new LambdaFunction(stack, "Fn", new LambdaFunctionProps
{
    Context = context,
    Runtime = "nodejs20.x",
    Handler = "index.handler",
    S3Bucket = "acme-dev-app-lambda-artifacts",
    S3Key = "functions/my-function.zip",
});

app.Synth();
