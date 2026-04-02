package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	cdkcontext "github.com/sevenpico/cdk-constructs/cdkcontext"
	eventbridgerule "github.com/sevenpico/cdk-constructs/cdkconstructeventbridgerule"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("EventbridgeRuleComprehensiveStack"), nil)

	context := cdkcontext.ContextFns_Make(&cdkcontext.ContextProps{
		Namespace:   jsii.String("acme"),
		Environment: jsii.String("dev"),
		Stage:       jsii.String("app"),
		Tags: &map[string]*string{
			"Owner":      jsii.String("platform-team"),
			"CostCenter": jsii.String("engineering"),
		},
	})

	eventbridgerule.NewEventbridgeRule(stack, jsii.String("Rule"), &eventbridgerule.EventbridgeRuleProps{
		Context:            context,
		Description:        jsii.String("Route acme.app order events to processing queue"),
		EventPattern:       &map[string]interface{}{"source": []string{"acme.app"}, "detail-type": []string{"OrderPlaced"}},
		TargetArn:          jsii.String("arn:aws:sqs:us-east-1:123456789012:acme-dev-app-orders"),
		RuleEnabled:        jsii.Bool(true),
		SourceEventBusName: jsii.String("acme-dev-app-events"),
	})

	app.Synth(nil)
}
