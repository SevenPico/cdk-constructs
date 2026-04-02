using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructIamRole;

var app = new App();
var stack = new Stack(app, "IamRoleDisabledStack");

var context = ContextFns.Make(new ContextProps
{
    Namespace = "acme",
    Environment = "dev",
    Stage = "app",
    Enabled = false,
});

new IamRole(stack, "Role", new IamRoleProps
{
    Context = context,
    RoleDescription = "Acme application role",
    Principals = new Dictionary<string, string[]>
    {
        ["Service"] = new[] { "lambda.amazonaws.com" },
    },
});

app.Synth();
