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
	awscdk.NewStack(app, jsii.String("MinimalContextExample"), &awscdk.StackProps{})

	// Build a context with required props only: namespace, environment, stage.
	ctx := cdkcontext.ContextFns_Make(&cdkcontext.ContextProps{
		Namespace:   jsii.String("acme"),
		Environment: jsii.String("dev"),
		Stage:       jsii.String("app"),
	})

	fmt.Println("Context ID:  ", *cdkcontext.ContextFns_Id(ctx))          // acme-dev-app
	fmt.Println("Is enabled:  ", *cdkcontext.ContextFns_IsEnabled(ctx))   // true
	fmt.Println("Tags:        ", cdkcontext.ContextFns_Tags(ctx))

	app.Synth(nil)
}

// Satisfy the constructs import (used indirectly by CDK).
var _ constructs.Construct
