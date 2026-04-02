package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	cdkcontext "github.com/sevenpico/cdk-constructs/cdkcontext"
	lambdafunction "github.com/sevenpico/cdk-constructs/cdkconstructlambdafunction"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("LambdaFunctionComprehensiveStack"), nil)

	context := cdkcontext.ContextFns_Make(&cdkcontext.ContextProps{
		Namespace:   jsii.String("acme"),
		Environment: jsii.String("dev"),
		Stage:       jsii.String("app"),
		Tags:        &map[string]*string{"Owner": jsii.String("platform-team"), "CostCenter": jsii.String("engineering")},
	})

	lambdafunction.NewLambdaFunction(stack, jsii.String("Fn"), &lambdafunction.LambdaFunctionProps{
		Context:                     context,
		Runtime:                     jsii.String("nodejs20.x"),
		Handler:                     jsii.String("index.handler"),
		S3Bucket:                    jsii.String("acme-dev-app-lambda-artifacts"),
		S3Key:                       jsii.String("functions/my-function.zip"),
		Description:                 jsii.String("Acme data processing function"),
		MemorySizeMb:                jsii.Number(512),
		TimeoutSeconds:              jsii.Number(30),
		Architecture:                jsii.String("arm64"),
		TracingMode:                 jsii.String("Active"),
		LambdaInsightsEnabled:       jsii.Bool(true),
		CloudwatchLogsRetentionDays: jsii.Number(30),
		ReservedConcurrentExecutions: jsii.Number(10),
		Environment: &lambdafunction.LambdaEnvironment{
			Variables: &map[string]*string{"LOG_LEVEL": jsii.String("INFO"), "STAGE": jsii.String("dev")},
		},
		SsmParameterNames: &[]*string{jsii.String("/acme/dev/app/db-url")},
	})

	app.Synth(nil)
}
