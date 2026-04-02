package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	cdkcontext "github.com/sevenpico/cdk-constructs/cdkcontext"
	s3bucket "github.com/sevenpico/cdk-constructs/cdkconstructs3bucket"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("S3BucketKmsEncryptedStack"), nil)

	context := cdkcontext.ContextFns_Make(&cdkcontext.ContextProps{
		Namespace:   jsii.String("acme"),
		Environment: jsii.String("dev"),
		Stage:       jsii.String("app"),
	})

	// KMS-encrypted bucket — sseAlgorithm 'aws:kms' with a KMS key ARN.
	// Creates a KMS grant resource in addition to the bucket.
	s3bucket.NewS3Bucket(stack, jsii.String("Bucket"), &s3bucket.S3BucketProps{
		Context:                   context,
		SseAlgorithm:              jsii.String("aws:kms"),
		KmsKeyArn:                 jsii.String("arn:aws:kms:us-east-1:123456789012:key/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"),
		BucketKeyEnabled:          jsii.Bool(true),
		AllowEncryptedUploadsOnly: jsii.Bool(true),
	})

	app.Synth(nil)
}
