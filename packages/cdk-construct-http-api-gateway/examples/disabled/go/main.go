package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	cdkcontext "github.com/sevenpico/cdk-constructs/cdkcontext"
	httpapigateway "github.com/sevenpico/cdk-constructs/cdkconstructhttpapigateway"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("HttpApiGatewayDisabledStack"), nil)

	context := cdkcontext.ContextFns_Make(&cdkcontext.ContextProps{
		Namespace:   jsii.String("acme"),
		Environment: jsii.String("dev"),
		Stage:       jsii.String("app"),
		Enabled:     jsii.Bool(false),
	})

	httpapigateway.NewHttpApiGateway(stack, jsii.String("Api"), &httpapigateway.HttpApiGatewayProps{
		Context: context,
	})

	app.Synth(nil)
}
