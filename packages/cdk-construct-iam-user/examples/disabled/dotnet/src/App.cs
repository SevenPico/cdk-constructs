using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructIamUser;

var app = new App();
var stack = new Stack(app, "IamUserDisabledStack");

var context = ContextFns.Make(new ContextProps
{
    Namespace = "acme",
    Environment = "dev",
    Stage = "app",
    Enabled = false,
});

new IamUser(stack, "User", new IamUserProps
{
    Context = context,
    UserName = "alice@example.com",
});

app.Synth();
