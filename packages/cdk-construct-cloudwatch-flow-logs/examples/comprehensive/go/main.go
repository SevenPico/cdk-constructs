package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	cdkcontext "github.com/sevenpico/cdk-constructs/cdkcontext"
	flowlogs "github.com/sevenpico/cdk-constructs/cdkconstructcloudwatchflowlogs"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("CloudwatchFlowLogsComprehensiveStack"), nil)

	context := cdkcontext.ContextFns_Make(&cdkcontext.ContextProps{
		Namespace:   jsii.String("acme"),
		Environment: jsii.String("dev"),
		Stage:       jsii.String("app"),
		Tags: &map[string]*string{
			"Owner":      jsii.String("platform-team"),
			"CostCenter": jsii.String("engineering"),
		},
	})

	flowlogs.NewCloudwatchFlowLogs(stack, jsii.String("FlowLogs"), &flowlogs.CloudwatchFlowLogsProps{
		Context:                    context,
		VpcId:                      jsii.String("vpc-0123456789abcdef0"),
		TrafficType:                jsii.String("REJECT"),
		CloudwatchLogRetentionDays: jsii.Number(90),
	})

	app.Synth(nil)
}
