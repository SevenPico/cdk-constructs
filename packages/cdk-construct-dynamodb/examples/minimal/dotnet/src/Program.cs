using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructDynamodb;

var app = new App();
var stack = new Stack(app, "DynamodbMinimalStack");

var context = ContextFns.Make(new ContextProps { Namespace = "acme", Environment = "dev", Stage = "app" });

new Dynamodb(stack, "Table", new DynamodbProps
{
    Context = context,
    HashKey = "id",
});

app.Synth();
