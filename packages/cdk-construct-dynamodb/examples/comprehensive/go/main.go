package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	cdkcontext "github.com/sevenpico/cdk-constructs/cdkcontext"
	dynamodb "github.com/sevenpico/cdk-constructs/cdkconstructdynamodb"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("DynamodbComprehensiveStack"), nil)

	context := cdkcontext.ContextFns_Make(&cdkcontext.ContextProps{
		Namespace:   jsii.String("acme"),
		Environment: jsii.String("dev"),
		Stage:       jsii.String("app"),
	})

	dynamodb.NewDynamodb(stack, jsii.String("Table"), &dynamodb.DynamodbProps{
		Context:                   context,
		HashKey:                   jsii.String("pk"),
		RangeKey:                  jsii.String("sk"),
		BillingMode:               jsii.String("PAY_PER_REQUEST"),
		EnableEncryption:          jsii.Bool(true),
		EnablePointInTimeRecovery: jsii.Bool(true),
		EnableStreams:              jsii.Bool(true),
		StreamViewType:            jsii.String("NEW_AND_OLD_IMAGES"),
		TtlEnabled:                jsii.Bool(true),
		TtlAttribute:              jsii.String("expiresAt"),
		GlobalSecondaryIndexes: &[]dynamodb.DynamodbGsi{
			{
				Name:           jsii.String("gsi1"),
				HashKey:        jsii.String("gsi1pk"),
				RangeKey:       jsii.String("gsi1sk"),
				ProjectionType: jsii.String("ALL"),
			},
		},
	})

	app.Synth(nil)
}
