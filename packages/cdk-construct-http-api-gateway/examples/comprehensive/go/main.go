package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	cdkcontext "github.com/sevenpico/cdk-constructs/cdkcontext"
	httpapigateway "github.com/sevenpico/cdk-constructs/cdkconstructhttpapigateway"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("HttpApiGatewayComprehensiveStack"), nil)

	context := cdkcontext.ContextFns_Make(&cdkcontext.ContextProps{
		Namespace:   jsii.String("acme"),
		Environment: jsii.String("dev"),
		Stage:       jsii.String("app"),
		Tags:        &map[string]*string{"Owner": jsii.String("platform-team"), "CostCenter": jsii.String("engineering")},
	})

	httpapigateway.NewHttpApiGateway(stack, jsii.String("Api"), &httpapigateway.HttpApiGatewayProps{
		Context:                     context,
		Description:                 jsii.String("Acme HTTP API"),
		EnableAutoDeploy:            jsii.Bool(true),
		CloudwatchLogsRetentionDays: jsii.Number(30),
		CorsConfiguration: &httpapigateway.HttpApiCorsConfig{
			AllowOrigins: &[]*string{jsii.String("https://acme.example.com")},
			AllowMethods: &[]*string{jsii.String("GET"), jsii.String("POST"), jsii.String("PUT"), jsii.String("DELETE")},
			AllowHeaders: &[]*string{jsii.String("Content-Type"), jsii.String("Authorization")},
			MaxAge:       jsii.Number(300),
		},
		Integrations: &map[string]*httpapigateway.HttpApiIntegration{
			"lambda": {
				Type:                 jsii.String("AWS_PROXY"),
				Uri:                  jsii.String("arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:123456789012:function:acme-dev-app/invocations"),
				PayloadFormatVersion: jsii.String("2.0"),
			},
		},
		Routes: &map[string]*httpapigateway.HttpApiRoute{
			"getItems": {RouteKey: jsii.String("GET /items"), IntegrationKey: jsii.String("lambda"), OperationName: jsii.String("GetItems")},
			"postItem": {RouteKey: jsii.String("POST /items"), IntegrationKey: jsii.String("lambda"), OperationName: jsii.String("PostItem")},
		},
		StageVariables: &map[string]*string{"env": jsii.String("dev")},
	})

	app.Synth(nil)
}
