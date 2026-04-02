package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	cdkcontext "github.com/sevenpico/cdk-constructs/cdkcontext"
	cloudtrail "github.com/sevenpico/cdk-constructs/cdkconstructcloudtrail"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("CloudtrailDisabledStack"), nil)

	context := cdkcontext.ContextFns_Make(&cdkcontext.ContextProps{
		Namespace:   jsii.String("acme"),
		Environment: jsii.String("dev"),
		Stage:       jsii.String("app"),
		Enabled:     jsii.Bool(false),
	})

	cloudtrail.NewCloudTrail(stack, jsii.String("Trail"), &cloudtrail.CloudtrailProps{
		Context:      context,
		S3BucketName: jsii.String("my-cloudtrail-logs-bucket"),
	})

	app.Synth(nil)
}
