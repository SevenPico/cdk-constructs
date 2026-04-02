package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	cdkcontext "github.com/sevenpico/cdk-constructs/cdkcontext"
	eventbridge "github.com/sevenpico/cdk-constructs/cdkconstructeventbridge"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("EventbridgeMinimalStack"), nil)

	context := cdkcontext.ContextFns_Make(&cdkcontext.ContextProps{
		Namespace:   jsii.String("acme"),
		Environment: jsii.String("dev"),
		Stage:       jsii.String("app"),
	})

	eventbridge.NewEventbridge(stack, jsii.String("Bus"), &eventbridge.EventbridgeProps{
		Context: context,
	})

	app.Synth(nil)
}
