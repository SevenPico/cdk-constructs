package main

import (
	"fmt"

	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/constructs-go/constructs/v10"
	"github.com/aws/jsii-runtime-go"
	cdkcontext "github.com/sevenpico/cdk-constructs/cdkcontext"
)

func main() {
	app := awscdk.NewApp(nil)
	awscdk.NewStack(app, jsii.String("DisabledContextExample"), &awscdk.StackProps{})

	// Build a disabled context.
	ctx := cdkcontext.ContextFns_Make(&cdkcontext.ContextProps{
		Namespace:   jsii.String("acme"),
		Environment: jsii.String("dev"),
		Stage:       jsii.String("app"),
		Enabled:     jsii.Bool(false),
	})

	fmt.Println("Context ID:  ", *cdkcontext.ContextFns_Id(ctx))
	fmt.Println("Is enabled:  ", *cdkcontext.ContextFns_IsEnabled(ctx)) // false

	// Extending a disabled context keeps enabled=false — the disabled flag is sticky.
	childCtx := cdkcontext.ContextFns_Extend(ctx, &cdkcontext.ContextProps{
		Attributes: &[]*string{jsii.String("worker")},
		Enabled:    jsii.Bool(true),
	})
	fmt.Println("Child enabled:", *cdkcontext.ContextFns_IsEnabled(childCtx)) // still false

	app.Synth(nil)
}

var _ constructs.Construct
