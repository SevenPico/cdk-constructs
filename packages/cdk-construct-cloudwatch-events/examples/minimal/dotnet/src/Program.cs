using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructCloudwatchEvents;

var app = new App();
var stack = new Stack(app, "CloudwatchEventsMinimalStack");

var context = ContextFns.Make(new ContextProps { Namespace = "acme", Environment = "dev", Stage = "app" });

new CloudwatchEvents(stack, "Events", new CloudwatchEventsProps
{
    Context = context,
    Rules = new[]
    {
        new CloudwatchEventRule
        {
            Name = "heartbeat",
            Schedule = "rate(5 minutes)",
            Targets = new[]
            {
                new CloudwatchEventTarget
                {
                    Type = "sns",
                    Arn = "arn:aws:sns:us-east-1:123456789012:my-topic",
                },
            },
        },
    },
});

app.Synth();
