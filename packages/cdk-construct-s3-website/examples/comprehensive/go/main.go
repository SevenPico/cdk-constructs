package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	cdkcontext "github.com/sevenpico/cdk-constructs/cdkcontext"
	s3website "github.com/sevenpico/cdk-constructs/cdkconstructs3website"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("S3WebsiteComprehensiveStack"), nil)

	context := cdkcontext.ContextFns_Make(&cdkcontext.ContextProps{
		Namespace:   jsii.String("acme"),
		Environment: jsii.String("dev"),
		Stage:       jsii.String("app"),
	})

	// Comprehensive S3Website — WAF, CloudFront logging, custom error responses,
	// CORS, geo restriction, DNS alias, deployment principals
	s3website.NewS3Website(stack, jsii.String("Website"), &s3website.S3WebsiteProps{
		Context:                         context,
		AcmCertificateArn:               jsii.String("arn:aws:acm:us-east-1:123456789012:certificate/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"),
		AdditionalAliases:               &[]*string{jsii.String("www.acme-dev-app.example.com")},
		DefaultRootObject:               jsii.String("index.html"),
		WafEnabled:                      jsii.Bool(true),
		CloudfrontAccessLoggingEnabled:  jsii.Bool(true),
		CloudfrontAccessLogBucketId:     jsii.String("acme-dev-app-cf-logs"),
		CloudfrontAccessLogPrefix:       jsii.String("cf/"),
		CorsAllowedOrigins:              &[]*string{jsii.String("https://acme-dev-app.example.com")},
		CustomErrorResponses: &[]s3website.CustomErrorResponse{
			{HttpStatus: jsii.Number(403), ResponseHttpStatus: jsii.Number(200), ResponsePagePath: jsii.String("/index.html"), Ttl: jsii.Number(10)},
			{HttpStatus: jsii.Number(404), ResponseHttpStatus: jsii.Number(200), ResponsePagePath: jsii.String("/index.html"), Ttl: jsii.Number(10)},
		},
		GeoRestriction: &s3website.GeoRestriction{
			RestrictionType: jsii.String("whitelist"),
			Locations:       &[]*string{jsii.String("US"), jsii.String("CA"), jsii.String("GB")},
		},
		DnsAliasEnabled:         jsii.Bool(true),
		ParentZoneId:            jsii.String("Z1234567890ABCDEF"),
		ParentZoneName:          jsii.String("example.com"),
		DeploymentPrincipalArns: &[]*string{jsii.String("arn:aws:iam::123456789012:role/acme-deploy-role")},
		TlsProtocolVersion:      jsii.String("TLSv1.2_2021"),
	})

	app.Synth(nil)
}
