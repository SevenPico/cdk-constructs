using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructDynamodb;

var app = new App();
var stack = new Stack(app, "DynamodbComprehensiveStack");

var context = ContextFns.Make(new ContextProps { Namespace = "acme", Environment = "dev", Stage = "app" });

new Dynamodb(stack, "Table", new DynamodbProps
{
    Context = context,
    HashKey = "pk",
    RangeKey = "sk",
    BillingMode = "PAY_PER_REQUEST",
    EnableEncryption = true,
    EnablePointInTimeRecovery = true,
    EnableStreams = true,
    StreamViewType = "NEW_AND_OLD_IMAGES",
    TtlEnabled = true,
    TtlAttribute = "expiresAt",
    GlobalSecondaryIndexes = new[]
    {
        new DynamodbGsi
        {
            Name = "gsi1",
            HashKey = "gsi1pk",
            RangeKey = "gsi1sk",
            ProjectionType = "ALL",
        },
    },
});

app.Synth();
