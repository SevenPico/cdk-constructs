package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	cdkcontext "github.com/sevenpico/cdk-constructs/cdkcontext"
	kmskey "github.com/sevenpico/cdk-constructs/cdkconstructkmskey"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("KmsKeyAsymmetricStack"), nil)

	context := cdkcontext.ContextFns_Make(&cdkcontext.ContextProps{
		Namespace:   jsii.String("acme"),
		Environment: jsii.String("dev"),
		Stage:       jsii.String("app"),
	})

	// RSA_2048 + SIGN_VERIFY creates an asymmetric key for signing operations.
	// Key rotation is not supported for asymmetric keys.
	kmskey.NewKmsKey(stack, jsii.String("Key"), &kmskey.KmsKeyProps{
		Context:           context,
		KeySpec:           jsii.String("RSA_2048"),
		KeyUsage:          jsii.String("SIGN_VERIFY"),
		EnableKeyRotation: jsii.Bool(false),
		Alias:             jsii.String("alias/acme-dev-app-signing"),
		Description:       jsii.String("Asymmetric RSA signing key"),
	})

	app.Synth(nil)
}
