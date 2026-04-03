package main

import (
	"fmt"

	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/constructs-go/constructs/v10"
	"github.com/aws/jsii-runtime-go"
	cdkbridge "github.com/sevenpico/cdk-constructs/cdkbridge"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("BasicBridgeExample"), &awscdk.StackProps{})

	// Read Context labels from the bridge fixture.
	ctx := cdkbridge.CdkBridge_Context(stack)
	fmt.Println("Context ID:  ", *ctx.Id())      // acme-dev-app
	fmt.Println("Is enabled:  ", *ctx.Enabled()) // true

	// Read a single Platform output — vpcId — as a string.
	vpcId := cdkbridge.CdkBridge_String_(stack, jsii.String("vpcId"), nil)
	fmt.Println("VPC ID:      ", *vpcId)

	awscdk.NewCfnOutput(stack, jsii.String("ContextId"), &awscdk.CfnOutputProps{Value: ctx.Id()})
	awscdk.NewCfnOutput(stack, jsii.String("VpcId"),     &awscdk.CfnOutputProps{Value: vpcId})

	app.Synth(nil)
}

var _ constructs.Construct
