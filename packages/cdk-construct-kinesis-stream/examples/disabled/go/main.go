package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	cdkcontext "github.com/sevenpico/cdk-constructs/cdkcontext"
	kinesisstream "github.com/sevenpico/cdk-constructs/cdkconstructkinesisstream"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("KinesisStreamDisabledStack"), nil)

	context := cdkcontext.ContextFns_Make(&cdkcontext.ContextProps{
		Namespace:   jsii.String("acme"),
		Environment: jsii.String("dev"),
		Stage:       jsii.String("app"),
		Enabled:     jsii.Bool(false),
	})

	kinesisstream.NewKinesisStream(stack, jsii.String("Stream"), &kinesisstream.KinesisStreamProps{
		Context: context,
	})

	app.Synth(nil)
}
