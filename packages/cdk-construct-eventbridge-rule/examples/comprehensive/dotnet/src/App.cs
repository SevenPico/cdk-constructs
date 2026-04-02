using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructEventbridgeRule;

var app = new App();
var stack = new Stack(app, "EventbridgeRuleComprehensiveStack");

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

new EventbridgeRule(stack, "Rule", new EventbridgeRuleProps
{
    Context = context,
    Description = "Route acme.app order events to processing queue",
    EventPattern = new System.Collections.Generic.Dictionary<string, object>
    {
        { "source", new[] { "acme.app" } },
        { "detail-type", new[] { "OrderPlaced" } },
    },
    TargetArn = "arn:aws:sqs:us-east-1:123456789012:acme-dev-app-orders",
    RuleEnabled = true,
    SourceEventBusName = "acme-dev-app-events",
});

app.Synth();
