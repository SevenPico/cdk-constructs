package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	cdkcontext "github.com/sevenpico/cdk-constructs/cdkcontext"
	dynamodb "github.com/sevenpico/cdk-constructs/cdkconstructdynamodb"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("DynamodbMinimalStack"), nil)

	context := cdkcontext.ContextFns_Make(&cdkcontext.ContextProps{
		Namespace:   jsii.String("acme"),
		Environment: jsii.String("dev"),
		Stage:       jsii.String("app"),
	})

	dynamodb.NewDynamodb(stack, jsii.String("Table"), &dynamodb.DynamodbProps{
		Context: context,
		HashKey: jsii.String("id"),
	})

	app.Synth(nil)
}
