using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructKinesisStream;

var app = new App();
var stack = new Stack(app, "KinesisStreamDisabledStack");

var context = ContextFns.Make(new ContextProps { Namespace = "acme", Environment = "dev", Stage = "app", Enabled = false });

new KinesisStream(stack, "Stream", new KinesisStreamProps
{
    Context = context,
});

app.Synth();
