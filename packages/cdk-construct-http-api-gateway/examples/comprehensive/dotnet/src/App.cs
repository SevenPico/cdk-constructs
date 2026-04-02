using System.Collections.Generic;
using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructHttpApiGateway;

var app = new App();
var stack = new Stack(app, "HttpApiGatewayComprehensiveStack");

var context = ContextFns.Make(new ContextProps
{
    Namespace = "acme",
    Environment = "dev",
    Stage = "app",
    Tags = new Dictionary<string, string> { ["Owner"] = "platform-team", ["CostCenter"] = "engineering" },
});

new HttpApiGateway(stack, "Api", new HttpApiGatewayProps
{
    Context = context,
    Description = "Acme HTTP API",
    EnableAutoDeploy = true,
    CloudwatchLogsRetentionDays = 30,
    CorsConfiguration = new HttpApiCorsConfig
    {
        AllowOrigins = new[] { "https://acme.example.com" },
        AllowMethods = new[] { "GET", "POST", "PUT", "DELETE" },
        AllowHeaders = new[] { "Content-Type", "Authorization" },
        MaxAge = 300,
    },
    Integrations = new Dictionary<string, HttpApiIntegration>
    {
        ["lambda"] = new HttpApiIntegration
        {
            Type = "AWS_PROXY",
            Uri = "arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:123456789012:function:acme-dev-app/invocations",
            PayloadFormatVersion = "2.0",
        },
    },
    Routes = new Dictionary<string, HttpApiRoute>
    {
        ["getItems"] = new HttpApiRoute { RouteKey = "GET /items", IntegrationKey = "lambda", OperationName = "GetItems" },
        ["postItem"] = new HttpApiRoute { RouteKey = "POST /items", IntegrationKey = "lambda", OperationName = "PostItem" },
    },
    StageVariables = new Dictionary<string, string> { ["env"] = "dev" },
});

app.Synth();
