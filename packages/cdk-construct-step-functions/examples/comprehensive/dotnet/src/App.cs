using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructStepFunctions;

var app = new App();
var stack = new Stack(app, "StepFunctionsComprehensiveStack");

var context = ContextFns.Make(new ContextProps
{
    Namespace = "acme",
    Environment = "dev",
    Stage = "app",
});

new StepFunctions(stack, "StateMachine", new StepFunctionsProps
{
    Context = context,
    RoleDescription = "Execution role for acme-dev-app workflow",
    Type = "EXPRESS",
    TracingEnabled = true,
    LogGroupRetentionDays = 30,
    LoggingConfiguration = new StepFunctionsLoggingConfig
    {
        Level = "ALL",
        IncludeExecutionData = true,
    },
    ManagedPolicyArns = new[] { "arn:aws:iam::aws:policy/AWSLambda_ReadOnlyAccess" },
    Definition = new Dictionary<string, object>
    {
        ["Comment"] = "Comprehensive state machine with Lambda invoke",
        ["StartAt"] = "ProcessInput",
        ["States"] = new Dictionary<string, object>
        {
            ["ProcessInput"] = new Dictionary<string, object>
            {
                ["Type"] = "Task",
                ["Resource"] = "arn:aws:states:::lambda:invoke",
                ["Parameters"] = new Dictionary<string, object>
                {
                    ["FunctionName"] = "arn:aws:lambda:us-east-1:123456789012:function:acme-dev-app-processor",
                    ["Payload.$"] = "$",
                },
                ["Next"] = "Success",
            },
            ["Success"] = new Dictionary<string, object> { ["Type"] = "Succeed" },
        },
    },
});

app.Synth();
