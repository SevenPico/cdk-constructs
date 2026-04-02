using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructSecret;

var app = new App();
var stack = new Stack(app, "SecretWithSnsStack");

var context = ContextFns.Make(new ContextProps { Namespace = "acme", Environment = "dev", Stage = "app" });

// Secret with SNS topic for change notifications, read principal, and description
new Secret(stack, "Secret", new SecretProps
{
    Context = context,
    Description = "Application credentials with SNS notifications",
    CreateSns = true,
    SecretReadPrincipals = new[]
    {
        new SecretReadPrincipal { Type = "AWS", Identifiers = new[] { "arn:aws:iam::123456789012:role/acme-app-role" } },
    },
    SnsPubPrincipals = new[]
    {
        new SecretReadPrincipal { Type = "Service", Identifiers = new[] { "secretsmanager.amazonaws.com" } },
    },
    SnsSubPrincipals = new[]
    {
        new SecretReadPrincipal { Type = "AWS", Identifiers = new[] { "arn:aws:iam::123456789012:role/acme-ops-role" } },
    },
});

app.Synth();
