using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructIamUser;

var app = new App();
var stack = new Stack(app, "IamUserComprehensiveStack");

var context = ContextFns.Make(new ContextProps
{
    Namespace = "acme",
    Environment = "dev",
    Stage = "app",
});

new IamUser(stack, "User", new IamUserProps
{
    Context = context,
    UserName = "alice@example.com",
    Path = "/engineering/",
    Groups = new[] { "developers", "readonly" },
    LoginProfileEnabled = true,
    PasswordResetRequired = true,
    PasswordLength = 32,
});

app.Synth();
