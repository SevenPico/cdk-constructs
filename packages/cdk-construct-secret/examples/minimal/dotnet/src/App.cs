using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructSecret;

var app = new App();
var stack = new Stack(app, "SecretMinimalStack");

var context = ContextFns.Make(new ContextProps { Namespace = "acme", Environment = "dev", Stage = "app" });

// Minimal Secret — all defaults: KMS key auto-created, no SNS
new Secret(stack, "Secret", new SecretProps { Context = context });

app.Synth();
