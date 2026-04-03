using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructIamRole;

var app = new App();
var stack = new Stack(app, "IamRoleComprehensiveStack");

var context = ContextFns.Make(new ContextProps
{
    Namespace = "acme",
    Environment = "dev",
    Stage = "app",
});

var policyDoc = System.Text.Json.JsonSerializer.Serialize(new
{
    Version = "2012-10-17",
    Statement = new[]
    {
        new
        {
            Effect = "Allow",
            Action = new[] { "s3:GetObject", "s3:PutObject" },
            Resource = "arn:aws:s3:::acme-dev-app-*/*",
        },
    },
});

new IamRole(stack, "Role", new IamRoleProps
{
    Context = context,
    RoleDescription = "Acme EC2 instance role with S3 access",
    Principals = new Dictionary<string, string[]>
    {
        ["Service"] = new[] { "ec2.amazonaws.com" },
    },
    ManagedPolicyArns = new[] { "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore" },
    InstanceProfileEnabled = true,
    MaxSessionDuration = 7200,
    PolicyDocuments = new[] { policyDoc },
});

app.Synth();
