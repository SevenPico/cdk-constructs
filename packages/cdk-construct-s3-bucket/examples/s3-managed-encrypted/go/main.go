package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	cdkcontext "github.com/sevenpico/cdk-constructs/cdkcontext"
	s3bucket "github.com/sevenpico/cdk-constructs/cdkconstructs3bucket"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("S3BucketS3ManagedEncryptedStack"), nil)

	context := cdkcontext.ContextFns_Make(&cdkcontext.ContextProps{
		Namespace:   jsii.String("acme"),
		Environment: jsii.String("dev"),
		Stage:       jsii.String("app"),
	})

	// S3-managed encryption — AES256 (default). No KMS key needed.
	s3bucket.NewS3Bucket(stack, jsii.String("Bucket"), &s3bucket.S3BucketProps{
		Context:      context,
		SseAlgorithm: jsii.String("AES256"),
	})

	app.Synth(nil)
}
