using Amazon.CDK;
using SevenPico.CdkBridge;
using SevenPico.CdkConstructSlackbot;

var app = new App();
var stack = new Stack(app, "SlackbotComprehensiveStack");

// Load context and platform references from CDK Bridge JSON.
var context = CdkBridge.Context(stack);
var slackTokenArn = CdkBridge.String(stack, "slackTokenArn");
var secretsKmsKeyArn = CdkBridge.String(stack, "secretsKmsKeyArn");

new Slackbot(stack, "SlackbotConstruct", new SlackbotProps
{
    Context = context,

    // Multiple Slack channels: SNS attribute name -> Slack channel ID
    SlackChannels = new Dictionary<string, string>
    {
        { "alerts", "C01234ABCDE" },
        { "deployments", "C09876ZYXWV" },
        { "incidents", "C0INCIDENT0" },
    },

    SlackTokenSecretArn = slackTokenArn,
    SlackTokenSecretKmsKeyArn = secretsKmsKeyArn,

    // Custom Lambda deployment package
    LambdaCodePath = "./lambda",
    LambdaRuntime = "python3.11",

    // Custom CloudWatch log retention (30 days instead of default 90)
    CloudwatchLogExpirationDays = 30,

    // Allow CloudWatch Alarms service to publish notifications
    SnsPubPrincipals = new Dictionary<string, string[]>
    {
        { "Service", new[] { "cloudwatch.amazonaws.com", "events.amazonaws.com" } },
    },

    // Allow specific IAM role to subscribe
    SnsSubPrincipals = new Dictionary<string, string[]>
    {
        { "AWS", new[] { "arn:aws:iam::123456789012:role/acme-dev-app-ops-role" } },
    },
});

app.Synth();
