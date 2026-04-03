using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructSqsQueue;

var app = new App();
var stack = new Stack(app, "SqsQueueMinimalStack");

var context = ContextFns.Make(new ContextProps { Namespace = "acme", Environment = "dev", Stage = "app" });

new SqsQueue(stack, "Queue", new SqsQueueProps
{
    Context = context,
});

app.Synth();
