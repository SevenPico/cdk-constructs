package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	cdkcontext "github.com/sevenpico/cdk-constructs/cdkcontext"
	sfn "github.com/sevenpico/cdk-constructs/cdkconstructstepfunctions"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("StepFunctionsComprehensiveStack"), nil)

	context := cdkcontext.ContextFns_Make(&cdkcontext.ContextProps{
		Namespace:   jsii.String("acme"),
		Environment: jsii.String("dev"),
		Stage:       jsii.String("app"),
	})

	sfn.NewStepFunctions(stack, jsii.String("StateMachine"), &sfn.StepFunctionsProps{
		Context:             context,
		RoleDescription:     jsii.String("Execution role for acme-dev-app workflow"),
		Type:                jsii.String("EXPRESS"),
		TracingEnabled:      jsii.Bool(true),
		LogGroupRetentionDays: jsii.Number(30),
		LoggingConfiguration: &sfn.StepFunctionsLoggingConfig{
			Level:                jsii.String("ALL"),
			IncludeExecutionData: jsii.Bool(true),
		},
		ManagedPolicyArns: &[]*string{jsii.String("arn:aws:iam::aws:policy/AWSLambda_ReadOnlyAccess")},
		Definition: &map[string]interface{}{
			"Comment":  "Comprehensive state machine with Lambda invoke",
			"StartAt":  "ProcessInput",
			"States": map[string]interface{}{
				"ProcessInput": map[string]interface{}{
					"Type":     "Task",
					"Resource": "arn:aws:states:::lambda:invoke",
					"Parameters": map[string]interface{}{
						"FunctionName": "arn:aws:lambda:us-east-1:123456789012:function:acme-dev-app-processor",
						"Payload.$":    "$",
					},
					"Next": "Success",
				},
				"Success": map[string]interface{}{"Type": "Succeed"},
			},
		},
	})

	app.Synth(nil)
}
