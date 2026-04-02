package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	cdkcontext "github.com/sevenpico/cdk-constructs/cdkcontext"
	eventbridgerule "github.com/sevenpico/cdk-constructs/cdkconstructeventbridgerule"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("EventbridgeRuleMinimalStack"), nil)

	context := cdkcontext.ContextFns_Make(&cdkcontext.ContextProps{
		Namespace:   jsii.String("acme"),
		Environment: jsii.String("dev"),
		Stage:       jsii.String("app"),
	})

	eventbridgerule.NewEventbridgeRule(stack, jsii.String("Rule"), &eventbridgerule.EventbridgeRuleProps{
		Context:      context,
		EventPattern: &map[string]interface{}{"source": []string{"acme.app"}},
		TargetArn:    jsii.String("arn:aws:sqs:us-east-1:123456789012:acme-dev-app"),
	})

	app.Synth(nil)
}
