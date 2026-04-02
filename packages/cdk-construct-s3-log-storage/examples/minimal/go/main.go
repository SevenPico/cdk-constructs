package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	"github.com/sevenpico/cdk-constructs/cdkbridge"
	s3logstorage "github.com/sevenpico/cdk-constructs/cdkconstructs3logstorage"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("S3LogStorageMinimalStack"), nil)

	// Load context from CDK Bridge JSON (sevenpico key in cdk.json context).
	context := cdkbridge.CdkBridge_Context(stack)

	s3logstorage.NewS3LogStorage(stack, jsii.String("LogStorage"), &s3logstorage.S3LogStorageProps{
		Context: context,
	})

	app.Synth(nil)
}
