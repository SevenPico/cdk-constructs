package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	"github.com/sevenpico/cdk-constructs/cdkbridge"
	sfnerror "github.com/sevenpico/cdk-constructs/cdkconstructsfnerrornotification"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("SfnErrorNotificationDisabledStack"), nil)

	// Load context with enabled: false — construct will create zero resources.
	context := cdkbridge.CdkBridge_Context(stack)
	stateMachineArn := cdkbridge.CdkBridge_String(stack, jsii.String("stateMachineArn"), nil)
	alarmsSnsTopicArn := cdkbridge.CdkBridge_String(stack, jsii.String("alarmsSnsTopicArn"), nil)

	sfnerror.NewSfnErrorNotification(stack, jsii.String("SfnMonitor"), &sfnerror.SfnErrorNotificationProps{
		Context:                context,
		StateMachineArn:        stateMachineArn,
		RateAlarmSnsTopicArn:   alarmsSnsTopicArn,
		VolumeAlarmSnsTopicArn: alarmsSnsTopicArn,
	})

	app.Synth(nil)
}
