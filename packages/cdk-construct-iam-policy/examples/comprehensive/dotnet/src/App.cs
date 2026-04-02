using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructIamPolicy;

var app = new App();
var stack = new Stack(app, "IamPolicyComprehensiveStack");

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
    Description = "Acme application read/write policy",
    PolicyStatements = new Dictionary<string, IamPolicyStatement>
    {
        ["AllowS3Read"] = new IamPolicyStatement
        {
            Effect = "Allow",
            Actions = new[] { "s3:GetObject", "s3:ListBucket" },
            Resources = new[] { "arn:aws:s3:::acme-dev-app-*", "arn:aws:s3:::acme-dev-app-*/*" },
        },
        ["AllowDynamoDBWrite"] = new IamPolicyStatement
        {
            Effect = "Allow",
            Actions = new[] { "dynamodb:PutItem", "dynamodb:UpdateItem", "dynamodb:GetItem" },
            Resources = new[] { "arn:aws:dynamodb:us-east-1:123456789012:table/acme-dev-app-*" },
        },
        ["DenyDelete"] = new IamPolicyStatement
        {
            Effect = "Deny",
            Actions = new[] { "s3:DeleteObject", "dynamodb:DeleteItem" },
            Resources = new[] { "*" },
        },
    },
});

app.Synth();
