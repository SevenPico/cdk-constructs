package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	cdkcontext "github.com/sevenpico/cdk-constructs/cdkcontext"
	secret "github.com/sevenpico/cdk-constructs/cdkconstructsecret"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("SecretDisabledStack"), nil)

	// Enabled: false — construct creates no resources
	context := cdkcontext.ContextFns_Make(&cdkcontext.ContextProps{
		Namespace:   jsii.String("acme"),
		Environment: jsii.String("dev"),
		Stage:       jsii.String("app"),
		Enabled:     jsii.Bool(false),
	})

	secret.NewSecret(stack, jsii.String("Secret"), &secret.SecretProps{
		Context: context,
	})

	app.Synth(nil)
}
