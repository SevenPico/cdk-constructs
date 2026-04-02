using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructKinesisStream;

var app = new App();
var stack = new Stack(app, "KinesisStreamComprehensiveStack");

var context = ContextFns.Make(new ContextProps { Namespace = "acme", Environment = "dev", Stage = "app" });

new KinesisStream(stack, "Stream", new KinesisStreamProps
{
    Context = context,
    ShardCount = 2,
    RetentionPeriodHours = 48,
    StreamMode = "PROVISIONED",
    EncryptionType = "KMS",
    ConsumerCount = 1,
});

app.Synth();
