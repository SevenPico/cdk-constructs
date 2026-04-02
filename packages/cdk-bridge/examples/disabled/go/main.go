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
	stack := awscdk.NewStack(app, jsii.String("DisabledBridgeExample"), &awscdk.StackProps{})

	// Read Context from bridge fixture — Enabled:false is set in the fixture.
	ctx := cdkbridge.CdkBridge_Context(stack)
	fmt.Println("Context ID:  ", *ctx.Id())
	fmt.Println("Is enabled:  ", *ctx.Enabled()) // false

	// Guard: skip resource creation when context is disabled.
	if !*ctx.Enabled() {
		fmt.Println("Context is disabled — skipping resource creation.")
	} else {
		vpcId := cdkbridge.CdkBridge_String_(stack, jsii.String("vpcId"), nil)
		fmt.Println("VPC ID:      ", *vpcId)
	}

	app.Synth(nil)
}

var _ constructs.Construct
