package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	"github.com/sevenpico/cdk-constructs/cdkbridge"
	s3bucket "github.com/sevenpico/cdk-constructs/cdkconstructs3bucket"
	s3logstorage "github.com/sevenpico/cdk-constructs/cdkconstructs3logstorage"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("S3LogStorageComprehensiveStack"), nil)

	// Load context and platform references from CDK Bridge JSON.
	context := cdkbridge.CdkBridge_Context(stack)
	logKmsKeyArn := cdkbridge.CdkBridge_String(stack, jsii.String("logKmsKeyArn"), nil)
	logsBucketName := cdkbridge.CdkBridge_String(stack, jsii.String("logsBucketName"), nil)

	s3logstorage.NewS3LogStorage(stack, jsii.String("LogStorage"), &s3logstorage.S3LogStorageProps{
		Context: context,

		// KMS encryption
		SseAlgorithm:     jsii.String("aws:kms"),
		KmsKeyArn:        logKmsKeyArn,
		BucketKeyEnabled: jsii.Bool(true),

		// Access logs
		AccessLogBucketName: logsBucketName,
		AccessLogPrefix:     jsii.String("acme-dev-app-logs/"),

		// SQS notifications
		NotificationsEnabled: jsii.Bool(true),
		NotificationsType:    jsii.String("SQS"),
		NotificationsPrefix:  jsii.String("raw/"),

		// Lifecycle rules
		LifecycleRules: &[]s3bucket.S3LifecycleRule{
			{
				Id:                                      jsii.String("expire-old-logs"),
				Enabled:                                 jsii.Bool(true),
				ExpirationDays:                          jsii.Number(365),
				NoncurrentVersionExpirationDays:         jsii.Number(30),
				AbortIncompleteMultipartUploadAfterDays: jsii.Number(7),
				Transitions: &[]s3bucket.S3LifecycleTransition{
					{
						StorageClass:        jsii.String("GLACIER"),
						TransitionAfterDays: jsii.Number(90),
					},
				},
			},
		},

		// Public access blocks
		BlockPublicAcls:       jsii.Bool(true),
		BlockPublicPolicy:     jsii.Bool(true),
		IgnorePublicAcls:      jsii.Bool(true),
		RestrictPublicBuckets: jsii.Bool(true),

		// SSL and versioning
		AllowSslRequestsOnly: jsii.Bool(true),
		VersioningEnabled:    jsii.Bool(true),
		ObjectOwnership:      jsii.String("ObjectWriter"),
	})

	app.Synth(nil)
}
