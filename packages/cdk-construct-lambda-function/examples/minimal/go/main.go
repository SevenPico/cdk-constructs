package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	cdkcontext "github.com/sevenpico/cdk-constructs/cdkcontext"
	lambdafunction "github.com/sevenpico/cdk-constructs/cdkconstructlambdafunction"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("LambdaFunctionMinimalStack"), nil)

	context := cdkcontext.ContextFns_Make(&cdkcontext.ContextProps{
		Namespace:   jsii.String("acme"),
		Environment: jsii.String("dev"),
		Stage:       jsii.String("app"),
	})

	lambdafunction.NewLambdaFunction(stack, jsii.String("Fn"), &lambdafunction.LambdaFunctionProps{
		Context:  context,
		Runtime:  jsii.String("nodejs20.x"),
		Handler:  jsii.String("index.handler"),
		S3Bucket: jsii.String("acme-dev-app-lambda-artifacts"),
		S3Key:    jsii.String("functions/my-function.zip"),
	})

	app.Synth(nil)
}
