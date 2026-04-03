using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructDynamodb;

var app = new App();
var stack = new Stack(app, "DynamodbDisabledStack");

var context = ContextFns.Make(new ContextProps { Namespace = "acme", Environment = "dev", Stage = "app", Enabled = false });

new Dynamodb(stack, "Table", new DynamodbProps
{
    Context = context,
    HashKey = "id",
});

app.Synth();
