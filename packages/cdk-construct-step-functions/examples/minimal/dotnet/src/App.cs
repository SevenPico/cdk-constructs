using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructStepFunctions;

var app = new App();
var stack = new Stack(app, "StepFunctionsMinimalStack");

var context = ContextFns.Make(new ContextProps
{
    Namespace = "acme",
    Environment = "dev",
    Stage = "app",
});

new StepFunctions(stack, "StateMachine", new StepFunctionsProps
{
    Context = context,
    RoleDescription = "Execution role for acme-dev-app state machine",
    Definition = new Dictionary<string, object>
    {
        ["Comment"] = "Minimal state machine",
        ["StartAt"] = "Pass",
        ["States"] = new Dictionary<string, object>
        {
            ["Pass"] = new Dictionary<string, object>
            {
                ["Type"] = "Pass",
                ["End"] = true,
            },
        },
    },
});

app.Synth();
