package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	cdkbridge "github.com/sevenpico/cdk-constructs/cdkbridge"
	s3bucket "github.com/sevenpico/cdk-constructs/cdkconstructs3bucket"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("S3BucketKmsEncryptedStack"), nil)

	// Context and kmsKeyArn come from the bridge fixture (cdk.json sevenpico block)
	context := cdkbridge.CdkBridge_Context(stack)
	kmsKeyArn := cdkbridge.CdkBridge_String_(stack, jsii.String("kmsKeyArn"), nil)

	// KMS-encrypted bucket — sseAlgorithm 'aws:kms' with a KMS key ARN from the bridge fixture.
	// Creates a KMS grant resource in addition to the bucket.
	s3bucket.NewS3Bucket(stack, jsii.String("Bucket"), &s3bucket.S3BucketProps{
		Context:                   context,
		SseAlgorithm:              jsii.String("aws:kms"),
		KmsKeyArn:                 kmsKeyArn,
		BucketKeyEnabled:          jsii.Bool(true),
		AllowEncryptedUploadsOnly: jsii.Bool(true),
	})

	app.Synth(nil)
}
