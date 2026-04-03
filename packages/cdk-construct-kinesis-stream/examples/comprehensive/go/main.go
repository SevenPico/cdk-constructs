package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	cdkcontext "github.com/sevenpico/cdk-constructs/cdkcontext"
	kinesisstream "github.com/sevenpico/cdk-constructs/cdkconstructkinesisstream"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("KinesisStreamComprehensiveStack"), nil)

	context := cdkcontext.ContextFns_Make(&cdkcontext.ContextProps{
		Namespace:   jsii.String("acme"),
		Environment: jsii.String("dev"),
		Stage:       jsii.String("app"),
	})

	kinesisstream.NewKinesisStream(stack, jsii.String("Stream"), &kinesisstream.KinesisStreamProps{
		Context:              context,
		ShardCount:           jsii.Number(2),
		RetentionPeriodHours: jsii.Number(48),
		StreamMode:           jsii.String("PROVISIONED"),
		EncryptionType:       jsii.String("KMS"),
		ConsumerCount:        jsii.Number(1),
	})

	app.Synth(nil)
}
