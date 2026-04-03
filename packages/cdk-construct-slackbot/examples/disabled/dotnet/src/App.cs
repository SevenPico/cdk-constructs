using Amazon.CDK;
using SevenPico.CdkBridge;
using SevenPico.CdkConstructSlackbot;

var app = new App();
var stack = new Stack(app, "SlackbotDisabledStack");

// Load context from CDK Bridge JSON. The cdk.json sets enabled: false,
// so the construct will create no resources.
var context = CdkBridge.Context(stack);
var slackTokenArn = CdkBridge.String(stack, "slackTokenArn");

new Slackbot(stack, "SlackbotConstruct", new SlackbotProps
{
    Context = context,
    SlackChannels = new Dictionary<string, string>
    {
        { "alerts", "C01234ABCDE" },
    },
    SlackTokenSecretArn = slackTokenArn,
    LambdaCodePath = "./lambda",
});

app.Synth();
