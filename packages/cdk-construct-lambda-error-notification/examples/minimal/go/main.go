package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	"github.com/sevenpico/cdk-constructs/cdkbridge"
	lambda "github.com/sevenpico/cdk-constructs/cdkconstructlambdaerrornotification"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("LambdaErrorNotificationMinimalStack"), nil)

	// Load context and platform references from CDK Bridge JSON.
	context := cdkbridge.CdkBridge_Context(stack)
	lambdaArn := cdkbridge.CdkBridge_String(stack, jsii.String("lambdaArn"), nil)
	lambdaFunctionName := cdkbridge.CdkBridge_String(stack, jsii.String("lambdaFunctionName"), nil)
	lambdaRoleName := cdkbridge.CdkBridge_String(stack, jsii.String("lambdaRoleName"), nil)
	alarmsSnsTopicArn := cdkbridge.CdkBridge_String(stack, jsii.String("alarmsSnsTopicArn"), nil)

	lambda.NewLambdaErrorNotification(stack, jsii.String("LambdaMonitor"), &lambda.LambdaErrorNotificationProps{
		Context:                context,
		LambdaArn:              lambdaArn,
		LambdaFunctionName:     lambdaFunctionName,
		LambdaRoleName:         lambdaRoleName,
		RateAlarmSnsTopicArn:   alarmsSnsTopicArn,
		VolumeAlarmSnsTopicArn: alarmsSnsTopicArn,
	})

	app.Synth(nil)
}
