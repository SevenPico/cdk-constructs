using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructKmsKey;

var app = new App();
var stack = new Stack(app, "KmsKeyMinimalStack");

var context = ContextFns.Make(new ContextProps { Namespace = "acme", Environment = "dev", Stage = "app" });

new KmsKey(stack, "Key", new KmsKeyProps
{
    Context = context,
});

app.Synth();
