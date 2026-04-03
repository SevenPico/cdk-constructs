package main

import (
	"fmt"

	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/constructs-go/constructs/v10"
	"github.com/aws/jsii-runtime-go"
	cdkbridge "github.com/sevenpico/cdk-constructs/cdkbridge"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("FullPlatformBridgeExample"), &awscdk.StackProps{})

	// Read the full context (namespace, environment, stage → computed ID + tags).
	ctx := cdkbridge.CdkBridge_Context(stack)
	fmt.Println("Context ID:          ", *ctx.Id())

	// VPC
	vpcId   := cdkbridge.CdkBridge_String_(stack, jsii.String("vpcId"), nil)
	vpcCidr := cdkbridge.CdkBridge_String_(stack, jsii.String("vpcCidrBlock"), nil)

	// KMS
	kmsKeyArn    := cdkbridge.CdkBridge_String_(stack, jsii.String("kmsKeyArn"), nil)
	logKmsKeyArn := cdkbridge.CdkBridge_String_(stack, jsii.String("logKmsKeyArn"), nil)

	// DNS / Hosted Zones
	publicZoneId   := cdkbridge.CdkBridge_String_(stack, jsii.String("publicZoneId"), nil)
	publicZoneName := cdkbridge.CdkBridge_String_(stack, jsii.String("publicZoneName"), nil)

	// Logs / Alarms
	logsBucketName    := cdkbridge.CdkBridge_String_(stack, jsii.String("logsBucketName"), nil)
	alarmsSnsTopicArn := cdkbridge.CdkBridge_String_(stack, jsii.String("alarmsSnsTopicArn"), nil)

	fmt.Println("VPC ID:              ", *vpcId)
	fmt.Println("VPC CIDR:            ", *vpcCidr)
	fmt.Println("KMS Key ARN:         ", *kmsKeyArn)
	fmt.Println("Log KMS Key ARN:     ", *logKmsKeyArn)
	fmt.Println("Public Zone ID:      ", *publicZoneId)
	fmt.Println("Public Zone Name:    ", *publicZoneName)
	fmt.Println("Logs Bucket:         ", *logsBucketName)
	fmt.Println("Alarms Topic ARN:    ", *alarmsSnsTopicArn)

	// Optional field with a default value.
	defaultCert := jsii.String("arn:aws:acm:us-east-1:000000000000:certificate/none")
	certArn := cdkbridge.CdkBridge_String_(stack, jsii.String("certificateArn"), defaultCert)
	fmt.Println("Certificate ARN:     ", *certArn)

	awscdk.NewCfnOutput(stack, jsii.String("ContextId"),      &awscdk.CfnOutputProps{Value: ctx.Id()})
	awscdk.NewCfnOutput(stack, jsii.String("VpcId"),          &awscdk.CfnOutputProps{Value: vpcId})
	awscdk.NewCfnOutput(stack, jsii.String("KmsKeyArn"),      &awscdk.CfnOutputProps{Value: kmsKeyArn})
	awscdk.NewCfnOutput(stack, jsii.String("PublicZoneName"), &awscdk.CfnOutputProps{Value: publicZoneName})
	awscdk.NewCfnOutput(stack, jsii.String("LogsBucketName"), &awscdk.CfnOutputProps{Value: logsBucketName})

	app.Synth(nil)
}

var _ constructs.Construct
