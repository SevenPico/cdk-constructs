package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	"github.com/sevenpico/cdk-constructs/cdkbridge"
	sfnerror "github.com/sevenpico/cdk-constructs/cdkconstructsfnerrornotification"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("SfnErrorNotificationComprehensiveStack"), nil)

	// Load context and platform references from CDK Bridge JSON.
	context := cdkbridge.CdkBridge_Context(stack)
	stateMachineArn := cdkbridge.CdkBridge_String(stack, jsii.String("stateMachineArn"), nil)
	alarmsSnsTopicArn := cdkbridge.CdkBridge_String(stack, jsii.String("alarmsSnsTopicArn"), nil)
	kmsKeyArn := cdkbridge.CdkBridge_String(stack, jsii.String("kmsKeyArn"), nil)

	sfnerror.NewSfnErrorNotification(stack, jsii.String("SfnMonitor"), &sfnerror.SfnErrorNotificationProps{
		Context:                context,
		StateMachineArn:        stateMachineArn,
		RateAlarmSnsTopicArn:   alarmsSnsTopicArn,
		VolumeAlarmSnsTopicArn: alarmsSnsTopicArn,

		// KMS-encrypted DLQ
		SqsKmsKeyArn:                kmsKeyArn,
		SqsQueueName:                jsii.String("acme-dev-app-processor-dlq"),
		SqsMessageRetentionSeconds:  jsii.Number(1209600),
		SqsVisibilityTimeoutSeconds: jsii.Number(30),

		// Alarm tuning
		AlarmPeriodSeconds:    jsii.Number(300),
		AlarmEvaluationPeriods: jsii.Number(3),
		AlarmDatapointsToAlarm: jsii.Number(2),
		RateAlarmName:         jsii.String("acme-dev-app-processor-error-rate"),
		VolumeAlarmName:       jsii.String("acme-dev-app-processor-error-volume"),

		// EventBridge Pipe tuning
		EventbridgePipeName:             jsii.String("acme-dev-app-processor-replay"),
		EventbridgePipeBatchSize:        jsii.Number(5),
		EventbridgePipeLogLevel:         jsii.String("INFO"),
		CloudwatchLogRetentionDays:      jsii.Number(30),
		TargetStepFunctionInputTemplate: jsii.String("<$.detail.input>"),

		// EventBridge rule name
		EventbridgeRuleName: jsii.String("acme-dev-app-processor-failed"),
	})

	app.Synth(nil)
}
