package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	cdkcontext "github.com/sevenpico/cdk-constructs/cdkcontext"
	s3website "github.com/sevenpico/cdk-constructs/cdkconstructs3website"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("S3WebsiteDisabledStack"), nil)

	// Enabled: false — construct creates no resources
	context := cdkcontext.ContextFns_Make(&cdkcontext.ContextProps{
		Namespace:   jsii.String("acme"),
		Environment: jsii.String("dev"),
		Stage:       jsii.String("app"),
		Enabled:     jsii.Bool(false),
	})

	s3website.NewS3Website(stack, jsii.String("Website"), &s3website.S3WebsiteProps{
		Context:          context,
		AcmCertificateArn: jsii.String("arn:aws:acm:us-east-1:123456789012:certificate/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"),
	})

	app.Synth(nil)
}
