package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	cdkcontext "github.com/sevenpico/cdk-constructs/cdkcontext"
	ses "github.com/sevenpico/cdk-constructs/cdkconstructses"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("SesWithIamGroupStack"), nil)

	context := cdkcontext.ContextFns_Make(&cdkcontext.ContextProps{
		Namespace:   jsii.String("acme"),
		Environment: jsii.String("dev"),
		Stage:       jsii.String("app"),
	})

	ses.NewSes(stack, jsii.String("Ses"), &ses.SesProps{
		Context:         context,
		SesGroupEnabled: jsii.Bool(true),
		SesGroupName:    jsii.String("ses-senders"),
	})

	app.Synth(nil)
}
