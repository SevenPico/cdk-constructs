using Amazon.CDK;
using SevenPico.CdkBridge;
using SevenPico.CdkConstructSlackbot;

var app = new App();
var stack = new Stack(app, "SlackbotWithKmsStack");

// Load context and platform references from CDK Bridge JSON.
var context = CdkBridge.Context(stack);
var slackTokenArn = CdkBridge.String(stack, "slackTokenArn");
var secretsKmsKeyArn = CdkBridge.String(stack, "secretsKmsKeyArn");

new Slackbot(stack, "SlackbotConstruct", new SlackbotProps
{
    Context = context,
    SlackChannels = new Dictionary<string, string>
    {
        { "alerts", "C01234ABCDE" },
    },
    SlackTokenSecretArn = slackTokenArn,
    SlackTokenSecretKmsKeyArn = secretsKmsKeyArn,
    LambdaCodePath = "./lambda",
});

app.Synth();
