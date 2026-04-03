package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	cdkcontext "github.com/sevenpico/cdk-constructs/cdkcontext"
	cloudtrail "github.com/sevenpico/cdk-constructs/cdkconstructcloudtrail"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("CloudtrailComprehensiveStack"), nil)

	context := cdkcontext.ContextFns_Make(&cdkcontext.ContextProps{
		Namespace:   jsii.String("acme"),
		Environment: jsii.String("dev"),
		Stage:       jsii.String("app"),
	})

	cloudtrail.NewCloudTrail(stack, jsii.String("Trail"), &cloudtrail.CloudtrailProps{
		Context:                      context,
		S3BucketName:                 jsii.String("my-cloudtrail-logs-bucket"),
		S3KeyPrefix:                  jsii.String("cloudtrail/"),
		IncludeGlobalServiceEvents:   jsii.Bool(true),
		IsMultiRegionTrail:           jsii.Bool(true),
		EnableLogFileValidation:      jsii.Bool(true),
		CloudWatchLogsEnabled:        jsii.Bool(true),
		CloudWatchLogsRetentionDays:  jsii.Number(90),
		EnableInsights:               jsii.Bool(true),
		ManagementEvents:             jsii.String("ReadWrite"),
		DataEvents: &[]cloudtrail.CloudtrailDataEventSelector{
			{
				ResourceType: jsii.String("AWS::S3::Object"),
				ResourceArns: &[]*string{jsii.String("arn:aws:s3:::")},
			},
		},
	})

	app.Synth(nil)
}
