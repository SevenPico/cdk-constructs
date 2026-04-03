using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructEventbridgeRule;

var app = new App();
var stack = new Stack(app, "EventbridgeRuleMinimalStack");

var context = ContextFns.Make(new ContextProps { Namespace = "acme", Environment = "dev", Stage = "app" });

new EventbridgeRule(stack, "Rule", new EventbridgeRuleProps
{
    Context = context,
    EventPattern = new System.Collections.Generic.Dictionary<string, object>
    {
        { "source", new[] { "acme.app" } },
    },
    TargetArn = "arn:aws:sqs:us-east-1:123456789012:acme-dev-app",
});

app.Synth();
