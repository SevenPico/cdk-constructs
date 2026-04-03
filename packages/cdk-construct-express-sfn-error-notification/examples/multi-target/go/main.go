package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	"github.com/sevenpico/cdk-constructs/cdkbridge"
	express "github.com/sevenpico/cdk-constructs/cdkconstructexpresssfnerrornotification"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("ExpressSfnErrorNotificationMultiTargetStack"), nil)

	// Load context and platform references from CDK Bridge JSON.
	context := cdkbridge.CdkBridge_Context(stack)
	processorArn := cdkbridge.CdkBridge_String(stack, jsii.String("processorArn"), nil)
	validatorArn := cdkbridge.CdkBridge_String(stack, jsii.String("validatorArn"), nil)
	alarmsSnsTopicArn := cdkbridge.CdkBridge_String(stack, jsii.String("alarmsSnsTopicArn"), nil)

	express.NewExpressSfnErrorNotification(stack, jsii.String("ExpressSfnMonitor"), &express.ExpressSfnErrorNotificationProps{
		Context: context,
		StepFunctions: &map[string]express.ExpressSfnTarget{
			"processor": {Arn: processorArn},
			"validator": {Arn: validatorArn},
		},
		RateAlarmSnsTopicArn:   alarmsSnsTopicArn,
		VolumeAlarmSnsTopicArn: alarmsSnsTopicArn,
	})

	app.Synth(nil)
}
