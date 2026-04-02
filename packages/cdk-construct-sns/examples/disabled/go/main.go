package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	cdkcontext "github.com/sevenpico/cdk-constructs/cdkcontext"
	sns "github.com/sevenpico/cdk-constructs/cdkconstructsns"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("SnsDisabledStack"), nil)

	context := cdkcontext.ContextFns_Make(&cdkcontext.ContextProps{
		Namespace:   jsii.String("acme"),
		Environment: jsii.String("dev"),
		Stage:       jsii.String("app"),
		Enabled:     jsii.Bool(false),
	})

	sns.NewSns(stack, jsii.String("Topic"), &sns.SnsProps{
		Context: context,
	})

	app.Synth(nil)
}
