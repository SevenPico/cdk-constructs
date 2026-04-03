package main

import (
	"fmt"

	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	"github.com/sevenpico/cdk-constructs/cdkbridge"
	s3logstorage "github.com/sevenpico/cdk-constructs/cdkconstructs3logstorage"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("S3LogStorageDisabledStack"), nil)

	// Load context from CDK Bridge JSON. The cdk.json sets enabled: false,
	// so the construct will create no resources.
	context := cdkbridge.CdkBridge_Context(stack)

	storage := s3logstorage.NewS3LogStorage(stack, jsii.String("LogStorage"), &s3logstorage.S3LogStorageProps{
		Context: context,
	})

	// Bucket and NotificationQueue are nil when disabled.
	fmt.Println("bucket:", storage.Bucket())
	fmt.Println("queue:", storage.NotificationQueue())

	app.Synth(nil)
}
