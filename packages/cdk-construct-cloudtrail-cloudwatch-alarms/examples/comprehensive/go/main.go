package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	cdkcontext "github.com/sevenpico/cdk-constructs/cdkcontext"
	alarms "github.com/sevenpico/cdk-constructs/cdkconstructcloudtrailcloudwatchalarms"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("CloudtrailCloudwatchAlarmsComprehensiveStack"), nil)

	context := cdkcontext.ContextFns_Make(&cdkcontext.ContextProps{
		Namespace:   jsii.String("acme"),
		Environment: jsii.String("dev"),
		Stage:       jsii.String("app"),
		Tags: &map[string]*string{
			"Owner":      jsii.String("platform-team"),
			"CostCenter": jsii.String("engineering"),
		},
	})

	alarms.NewCloudtrailCloudwatchAlarms(stack, jsii.String("Alarms"), &alarms.CloudtrailCloudwatchAlarmsProps{
		Context:                context,
		LogGroupName:           jsii.String("/aws/cloudtrail/acme-dev-app"),
		SnsTopicArn:            jsii.String("arn:aws:sns:us-east-1:123456789012:acme-dev-app-alerts"),
		AlarmNamespace:         jsii.String("AcmeSecurity"),
		AlarmPeriodSeconds:     jsii.Number(60),
		AlarmEvaluationPeriods: jsii.Number(1),
		AlarmThreshold:         jsii.Number(1),
		EnabledAlarms:          &[]*string{jsii.String("unauthorized-api"), jsii.String("root-usage"), jsii.String("iam-policy-changes"), jsii.String("cloudtrail-changes")},
	})

	app.Synth(nil)
}
