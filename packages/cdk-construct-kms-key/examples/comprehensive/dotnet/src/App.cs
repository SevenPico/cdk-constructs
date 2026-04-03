using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructKmsKey;

var app = new App();
var stack = new Stack(app, "KmsKeyComprehensiveStack");

var context = ContextFns.Make(new ContextProps { Namespace = "acme", Environment = "dev", Stage = "app" });

var policy = "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\","
    + "\"Principal\":{\"AWS\":\"arn:aws:iam::123456789012:root\"},"
    + "\"Action\":\"kms:*\",\"Resource\":\"*\"}]}";

new KmsKey(stack, "Key", new KmsKeyProps
{
    Context = context,
    Alias = "alias/acme-dev-app-custom",
    Description = "Comprehensive KMS key example — all props exercised",
    EnableKeyRotation = false,
    PendingWindowInDays = 14,
    MultiRegion = true,
    Policy = policy,
});

app.Synth();
