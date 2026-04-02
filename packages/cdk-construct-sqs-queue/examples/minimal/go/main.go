package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	cdkcontext "github.com/sevenpico/cdk-constructs/cdkcontext"
	sqsqueue "github.com/sevenpico/cdk-constructs/cdkconstructsqsqueue"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("SqsQueueMinimalStack"), nil)

	context := cdkcontext.ContextFns_Make(&cdkcontext.ContextProps{
		Namespace:   jsii.String("acme"),
		Environment: jsii.String("dev"),
		Stage:       jsii.String("app"),
	})

	sqsqueue.NewSqsQueue(stack, jsii.String("Queue"), &sqsqueue.SqsQueueProps{
		Context: context,
	})

	app.Synth(nil)
}
