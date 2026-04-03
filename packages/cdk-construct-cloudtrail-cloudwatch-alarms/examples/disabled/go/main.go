package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	cdkcontext "github.com/sevenpico/cdk-constructs/cdkcontext"
	alarms "github.com/sevenpico/cdk-constructs/cdkconstructcloudtrailcloudwatchalarms"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("CloudtrailCloudwatchAlarmsDisabledStack"), nil)

	context := cdkcontext.ContextFns_Make(&cdkcontext.ContextProps{
		Namespace:   jsii.String("acme"),
		Environment: jsii.String("dev"),
		Stage:       jsii.String("app"),
		Enabled:     jsii.Bool(false),
	})

	alarms.NewCloudtrailCloudwatchAlarms(stack, jsii.String("Alarms"), &alarms.CloudtrailCloudwatchAlarmsProps{
		Context:      context,
		LogGroupName: jsii.String("/aws/cloudtrail/acme-dev-app"),
		SnsTopicArn:  jsii.String("arn:aws:sns:us-east-1:123456789012:acme-dev-app-alerts"),
	})

	app.Synth(nil)
}
