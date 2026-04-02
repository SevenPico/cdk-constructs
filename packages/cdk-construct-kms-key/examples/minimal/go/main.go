package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	cdkcontext "github.com/sevenpico/cdk-constructs/cdkcontext"
	kmskey "github.com/sevenpico/cdk-constructs/cdkconstructkmskey"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("KmsKeyMinimalStack"), nil)

	context := cdkcontext.ContextFns_Make(&cdkcontext.ContextProps{
		Namespace:   jsii.String("acme"),
		Environment: jsii.String("dev"),
		Stage:       jsii.String("app"),
	})

	kmskey.NewKmsKey(stack, jsii.String("Key"), &kmskey.KmsKeyProps{
		Context: context,
	})

	app.Synth(nil)
}
