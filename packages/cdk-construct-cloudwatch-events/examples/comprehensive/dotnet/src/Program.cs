using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructCloudwatchEvents;

var app = new App();
var stack = new Stack(app, "CloudwatchEventsComprehensiveStack");

var context = ContextFns.Make(new ContextProps { Namespace = "acme", Environment = "dev", Stage = "app" });

new CloudwatchEvents(stack, "Events", new CloudwatchEventsProps
{
    Context = context,
    Rules = new[]
    {
        new CloudwatchEventRule
        {
            Name = "heartbeat",
            Description = "Scheduled heartbeat every 5 minutes",
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
        new CloudwatchEventRule
        {
            Name = "ec2-state-change",
            Description = "Reacts to EC2 instance state changes",
            EventPattern = "{\"source\":[\"aws.ec2\"],\"detail-type\":[\"EC2 Instance State-change Notification\"]}",
            Targets = new[]
            {
                new CloudwatchEventTarget
                {
                    Type = "sqs",
                    Arn = "arn:aws:sqs:us-east-1:123456789012:my-queue",
                },
            },
        },
    },
});

app.Synth();
