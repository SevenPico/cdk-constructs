package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	"github.com/sevenpico/cdk-constructs/cdkbridge"
	lambda "github.com/sevenpico/cdk-constructs/cdkconstructlambdaerrornotification"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("LambdaErrorNotificationComprehensiveStack"), nil)

	// Load context and platform references from CDK Bridge JSON.
	context := cdkbridge.CdkBridge_Context(stack)
	lambdaArn := cdkbridge.CdkBridge_String(stack, jsii.String("lambdaArn"), nil)
	lambdaFunctionName := cdkbridge.CdkBridge_String(stack, jsii.String("lambdaFunctionName"), nil)
	lambdaRoleName := cdkbridge.CdkBridge_String(stack, jsii.String("lambdaRoleName"), nil)
	alarmsSnsTopicArn := cdkbridge.CdkBridge_String(stack, jsii.String("alarmsSnsTopicArn"), nil)
	kmsKeyArn := cdkbridge.CdkBridge_String(stack, jsii.String("kmsKeyArn"), nil)
	kmsKeyId := cdkbridge.CdkBridge_String(stack, jsii.String("kmsKeyId"), nil)

	lambda.NewLambdaErrorNotification(stack, jsii.String("LambdaMonitor"), &lambda.LambdaErrorNotificationProps{
		Context:                context,
		LambdaArn:              lambdaArn,
		LambdaFunctionName:     lambdaFunctionName,
		LambdaRoleName:         lambdaRoleName,
		RateAlarmSnsTopicArn:   alarmsSnsTopicArn,
		VolumeAlarmSnsTopicArn: alarmsSnsTopicArn,

		// KMS-encrypted DLQ
		SqsKmsConfig:                &lambda.SqsKmsConfig{KeyId: kmsKeyId, KeyArn: kmsKeyArn},
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
		EventbridgePipeName:         jsii.String("acme-dev-app-processor-replay"),
		EventbridgePipeBatchSize:    jsii.Number(5),
		EventbridgePipeLogLevel:     jsii.String("INFO"),
		CloudwatchLogRetentionDays:  jsii.Number(30),
		TargetLambdaInputTemplate:   jsii.String("<$.requestPayload>"),
	})

	app.Synth(nil)
}
