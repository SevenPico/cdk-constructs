using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructKmsKey;

var app = new App();
var stack = new Stack(app, "KmsKeyAsymmetricStack");

var context = ContextFns.Make(new ContextProps { Namespace = "acme", Environment = "dev", Stage = "app" });

// RSA_2048 + SIGN_VERIFY creates an asymmetric key for signing operations.
// Key rotation is not supported for asymmetric keys.
new KmsKey(stack, "Key", new KmsKeyProps
{
    Context = context,
    KeySpec = "RSA_2048",
    KeyUsage = "SIGN_VERIFY",
    EnableKeyRotation = false,
    Alias = "alias/acme-dev-app-signing",
    Description = "Asymmetric RSA signing key",
});

app.Synth();
