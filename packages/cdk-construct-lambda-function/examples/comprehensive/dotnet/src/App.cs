using System.Collections.Generic;
using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructLambdaFunction;

var app = new App();
var stack = new Stack(app, "LambdaFunctionComprehensiveStack");

var context = ContextFns.Make(new ContextProps
{
    Namespace = "acme",
    Environment = "dev",
    Stage = "app",
    Tags = new Dictionary<string, string> { ["Owner"] = "platform-team", ["CostCenter"] = "engineering" },
});

new LambdaFunction(stack, "Fn", new LambdaFunctionProps
{
    Context = context,
    Runtime = "nodejs20.x",
    Handler = "index.handler",
    S3Bucket = "acme-dev-app-lambda-artifacts",
    S3Key = "functions/my-function.zip",
    Description = "Acme data processing function",
    MemorySizeMb = 512,
    TimeoutSeconds = 30,
    Architecture = "arm64",
    TracingMode = "Active",
    LambdaInsightsEnabled = true,
    CloudwatchLogsRetentionDays = 30,
    ReservedConcurrentExecutions = 10,
    Environment = new LambdaEnvironment
    {
        Variables = new Dictionary<string, string> { ["LOG_LEVEL"] = "INFO", ["STAGE"] = "dev" },
    },
    SsmParameterNames = new[] { "/acme/dev/app/db-url" },
});

app.Synth();
