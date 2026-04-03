using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructSqsQueue;

var app = new App();
var stack = new Stack(app, "SqsQueueDisabledStack");

var context = ContextFns.Make(new ContextProps
{
    Namespace = "acme",
    Environment = "dev",
    Stage = "app",
    Enabled = false,
});

new SqsQueue(stack, "Queue", new SqsQueueProps
{
    Context = context,
});

app.Synth();
