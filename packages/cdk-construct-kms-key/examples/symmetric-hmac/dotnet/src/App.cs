using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructKmsKey;

var app = new App();
var stack = new Stack(app, "KmsKeySymmetricHmacStack");

var context = ContextFns.Make(new ContextProps { Namespace = "acme", Environment = "dev", Stage = "app" });

// HMAC_256 + GENERATE_VERIFY_MAC creates an HMAC key for MAC generation/verification.
// Key rotation is not supported for HMAC keys.
new KmsKey(stack, "Key", new KmsKeyProps
{
    Context = context,
    KeySpec = "HMAC_256",
    KeyUsage = "GENERATE_VERIFY_MAC",
    EnableKeyRotation = false,
    Alias = "alias/acme-dev-app-hmac",
    Description = "HMAC-256 key for MAC generation and verification",
});

app.Synth();
