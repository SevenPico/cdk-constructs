using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructSqsQueue;

var app = new App();
var stack = new Stack(app, "SqsQueueComprehensiveStack");

var context = ContextFns.Make(new ContextProps
{
    Namespace = "acme",
    Environment = "dev",
    Stage = "app",
    Tags = new System.Collections.Generic.Dictionary<string, string>
    {
        { "Owner", "platform-team" },
        { "CostCenter", "engineering" },
    },
});

new SqsQueue(stack, "Queue", new SqsQueueProps
{
    Context = context,
    VisibilityTimeoutSeconds = 300,
    MessageRetentionSeconds = 86400,
    DlqEnabled = true,
    SqsManagedSseEnabled = true,
});

app.Synth();
