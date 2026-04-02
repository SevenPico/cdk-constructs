using Amazon.CDK;
using SevenPico.CdkContext;
using SevenPico.CdkConstructSecret;

var app = new App();
var stack = new Stack(app, "SecretDisabledStack");

// Enabled = false — construct creates no resources
var context = ContextFns.Make(new ContextProps { Namespace = "acme", Environment = "dev", Stage = "app", Enabled = false });

new Secret(stack, "Secret", new SecretProps { Context = context });

app.Synth();
