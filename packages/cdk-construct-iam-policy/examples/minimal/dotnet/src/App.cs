using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructIamPolicy;

var app = new App();
var stack = new Stack(app, "IamPolicyMinimalStack");

var context = ContextFns.Make(new ContextProps
{
    Namespace = "acme",
    Environment = "dev",
    Stage = "app",
});

new IamPolicy(stack, "Policy", new IamPolicyProps
{
    Context = context,
    IamPolicyEnabled = true,
    PolicyStatements = new Dictionary<string, IamPolicyStatement>
    {
        ["AllowS3Read"] = new IamPolicyStatement
        {
            Effect = "Allow",
            Actions = new[] { "s3:GetObject", "s3:ListBucket" },
            Resources = new[] { "*" },
        },
    },
});

app.Synth();
