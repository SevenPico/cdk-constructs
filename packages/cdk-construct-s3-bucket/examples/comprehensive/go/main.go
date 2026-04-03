package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	cdkcontext "github.com/sevenpico/cdk-constructs/cdkcontext"
	s3bucket "github.com/sevenpico/cdk-constructs/cdkconstructs3bucket"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("S3BucketComprehensiveStack"), nil)

	context := cdkcontext.ContextFns_Make(&cdkcontext.ContextProps{
		Namespace:   jsii.String("acme"),
		Environment: jsii.String("dev"),
		Stage:       jsii.String("app"),
	})

	s3bucket.NewS3Bucket(stack, jsii.String("Bucket"), &s3bucket.S3BucketProps{
		Context:                    context,
		VersioningEnabled:          jsii.Bool(true),
		TransferAccelerationEnabled: jsii.Bool(true),
		ObjectOwnership:            jsii.String("BucketOwnerEnforced"),
		AllowSslRequestsOnly:       jsii.Bool(true),
		LifecycleRules: &[]s3bucket.S3LifecycleRule{
			{
				Id:                                  jsii.String("expire-old-versions"),
				Enabled:                             jsii.Bool(true),
				NoncurrentVersionExpirationDays:     jsii.Number(30),
				AbortIncompleteMultipartUploadAfterDays: jsii.Number(7),
				Transitions: &[]s3bucket.S3LifecycleTransition{
					{StorageClass: jsii.String("STANDARD_IA"), TransitionAfterDays: jsii.Number(90)},
					{StorageClass: jsii.String("GLACIER"), TransitionAfterDays: jsii.Number(365)},
				},
			},
		},
		CorsRules: &[]s3bucket.S3CorsRule{
			{
				AllowedMethods: &[]*string{jsii.String("GET"), jsii.String("PUT")},
				AllowedOrigins: &[]*string{jsii.String("https://acme.example.com")},
				AllowedHeaders: &[]*string{jsii.String("*")},
				MaxAge:         jsii.Number(3600),
			},
		},
	})

	app.Synth(nil)
}
