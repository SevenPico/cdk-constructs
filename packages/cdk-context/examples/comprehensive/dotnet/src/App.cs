using Amazon.CDK;
using SevenPico.CdkContext;

var app = new App();
var stack = new Stack(app, "ComprehensiveContextExample");

// Build a context with all available props exercised.
var ctx = ContextFns.Make(new ContextProps
{
    Namespace = "acme",
    Environment = "dev",
    Stage = "app",
    Name = "api",
    Tenant = "tenant1",
    Region = "use1",

    Delimiter = "-",
    LabelOrder = new[] { "namespace", "environment", "stage", "name", "attributes" },
    LabelKeyCase = "title",
    LabelValueCase = "lower",
    IdLengthLimit = 32,
    Attributes = new[] { "v2" },

    Tags = new Dictionary<string, string>
    {
        ["CostCenter"] = "engineering",
        ["Owner"] = "platform-team",
    },
    AdditionalTagMap = new Dictionary<string, string>
    {
        ["ManagedBy"] = "cdk",
    },
    LabelsAsTags = new[] { "namespace", "environment", "stage", "name" },
});

Console.WriteLine($"Context ID:    {ContextFns.Id(ctx)}");
Console.WriteLine($"Is enabled:    {ContextFns.IsEnabled(ctx)}");
Console.WriteLine($"Tags:          {string.Join(", ", ContextFns.Tags(ctx))}");

// Demonstrate context extension
var childCtx = ContextFns.Extend(ctx, new ContextProps { Attributes = new[] { "worker" } });
Console.WriteLine($"Child ID:      {ContextFns.Id(childCtx)}");

app.Synth();
