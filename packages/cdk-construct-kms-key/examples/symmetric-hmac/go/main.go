package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	cdkcontext "github.com/sevenpico/cdk-constructs/cdkcontext"
	kmskey "github.com/sevenpico/cdk-constructs/cdkconstructkmskey"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("KmsKeySymmetricHmacStack"), nil)

	context := cdkcontext.ContextFns_Make(&cdkcontext.ContextProps{
		Namespace:   jsii.String("acme"),
		Environment: jsii.String("dev"),
		Stage:       jsii.String("app"),
	})

	// HMAC_256 + GENERATE_VERIFY_MAC creates an HMAC key for MAC generation/verification.
	// Key rotation is not supported for HMAC keys.
	kmskey.NewKmsKey(stack, jsii.String("Key"), &kmskey.KmsKeyProps{
		Context:           context,
		KeySpec:           jsii.String("HMAC_256"),
		KeyUsage:          jsii.String("GENERATE_VERIFY_MAC"),
		EnableKeyRotation: jsii.Bool(false),
		Alias:             jsii.String("alias/acme-dev-app-hmac"),
		Description:       jsii.String("HMAC-256 key for MAC generation and verification"),
	})

	app.Synth(nil)
}
