package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	cdkcontext "github.com/sevenpico/cdk-constructs/cdkcontext"
	sfn "github.com/sevenpico/cdk-constructs/cdkconstructstepfunctions"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("StepFunctionsDisabledStack"), nil)

	context := cdkcontext.ContextFns_Make(&cdkcontext.ContextProps{
		Namespace:   jsii.String("acme"),
		Environment: jsii.String("dev"),
		Stage:       jsii.String("app"),
		Enabled:     jsii.Bool(false),
	})

	sfn.NewStepFunctions(stack, jsii.String("StateMachine"), &sfn.StepFunctionsProps{
		Context:         context,
		RoleDescription: jsii.String("Execution role for acme-dev-app state machine"),
		Definition: &map[string]interface{}{
			"Comment":  "Minimal state machine",
			"StartAt":  "Pass",
			"States":   map[string]interface{}{"Pass": map[string]interface{}{"Type": "Pass", "End": true}},
		},
	})

	app.Synth(nil)
}
