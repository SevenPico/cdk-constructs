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
	awscdk.NewStack(app, jsii.String("ComprehensiveContextExample"), &awscdk.StackProps{})

	// Build a context with all available props exercised.
	ctx := cdkcontext.ContextFns_Make(&cdkcontext.ContextProps{
		Namespace:   jsii.String("acme"),
		Environment: jsii.String("dev"),
		Stage:       jsii.String("app"),
		Name:        jsii.String("api"),
		Tenant:      jsii.String("tenant1"),
		Region:      jsii.String("use1"),

		Delimiter:      jsii.String("-"),
		LabelOrder:     &[]*string{jsii.String("namespace"), jsii.String("environment"), jsii.String("stage"), jsii.String("name"), jsii.String("attributes")},
		LabelKeyCase:   jsii.String("title"),
		LabelValueCase: jsii.String("lower"),
		IdLengthLimit:  jsii.Number(32),
		Attributes:     &[]*string{jsii.String("v2")},

		Tags: &map[string]*string{
			"CostCenter": jsii.String("engineering"),
			"Owner":      jsii.String("platform-team"),
		},
		AdditionalTagMap: &map[string]*string{
			"ManagedBy": jsii.String("cdk"),
		},
		LabelsAsTags: &[]*string{jsii.String("namespace"), jsii.String("environment"), jsii.String("stage"), jsii.String("name")},
	})

	fmt.Println("Context ID:    ", *cdkcontext.ContextFns_Id(ctx))
	fmt.Println("Is enabled:    ", *cdkcontext.ContextFns_IsEnabled(ctx))
	fmt.Println("Tags:          ", cdkcontext.ContextFns_Tags(ctx))

	// Demonstrate context extension
	childCtx := cdkcontext.ContextFns_Extend(ctx, &cdkcontext.ContextProps{
		Attributes: &[]*string{jsii.String("worker")},
	})
	fmt.Println("Child ID:      ", *cdkcontext.ContextFns_Id(childCtx))

	app.Synth(nil)
}

var _ constructs.Construct
