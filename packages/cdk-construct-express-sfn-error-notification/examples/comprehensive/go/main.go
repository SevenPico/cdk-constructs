package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	"github.com/sevenpico/cdk-constructs/cdkbridge"
	express "github.com/sevenpico/cdk-constructs/cdkconstructexpresssfnerrornotification"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("ExpressSfnErrorNotificationComprehensiveStack"), nil)

	// Load context and platform references from CDK Bridge JSON.
	context := cdkbridge.CdkBridge_Context(stack)
	processorArn := cdkbridge.CdkBridge_String(stack, jsii.String("processorArn"), nil)
	alarmsSnsTopicArn := cdkbridge.CdkBridge_String(stack, jsii.String("alarmsSnsTopicArn"), nil)
	kmsKeyArn := cdkbridge.CdkBridge_String(stack, jsii.String("kmsKeyArn"), nil)
	kmsKeyId := cdkbridge.CdkBridge_String(stack, jsii.String("kmsKeyId"), nil)

	express.NewExpressSfnErrorNotification(stack, jsii.String("ExpressSfnMonitor"), &express.ExpressSfnErrorNotificationProps{
		Context: context,
		StepFunctions: &map[string]express.ExpressSfnTarget{
			"processor": {
				Arn:             processorArn,
				SqsQueueName:    jsii.String("acme-dev-app-processor-dlq"),
				RateAlarmName:   jsii.String("acme-dev-app-processor-error-rate"),
				VolumeAlarmName: jsii.String("acme-dev-app-processor-error-volume"),
			},
		},
		RateAlarmSnsTopicArn:   alarmsSnsTopicArn,
		VolumeAlarmSnsTopicArn: alarmsSnsTopicArn,

		// KMS-encrypted DLQs
		SqsKmsConfig:                &express.SqsKmsConfig{KeyId: kmsKeyId, KeyArn: kmsKeyArn},
		SqsMessageRetentionSeconds:  jsii.Number(1209600),
		SqsVisibilityTimeoutSeconds: jsii.Number(60),

		// Alarm tuning
		AlarmPeriodSeconds:    jsii.Number(300),
		AlarmEvaluationPeriods: jsii.Number(3),
		AlarmDatapointsToAlarm: jsii.Number(2),

		// EventBridge Pipe tuning
		EventbridgePipeBatchSize:        jsii.Number(5),
		EventbridgePipeLogLevel:         jsii.String("INFO"),
		CloudwatchLogRetentionDays:      jsii.Number(30),
		TargetStepFunctionInputTemplate: jsii.String("<$.detail.input>"),
	})

	app.Synth(nil)
}
