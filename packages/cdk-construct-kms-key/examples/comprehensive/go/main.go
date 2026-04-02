package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	cdkcontext "github.com/sevenpico/cdk-constructs/cdkcontext"
	kmskey "github.com/sevenpico/cdk-constructs/cdkconstructkmskey"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("KmsKeyComprehensiveStack"), nil)

	context := cdkcontext.ContextFns_Make(&cdkcontext.ContextProps{
		Namespace:   jsii.String("acme"),
		Environment: jsii.String("dev"),
		Stage:       jsii.String("app"),
	})

	policy := `{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"AWS":"arn:aws:iam::123456789012:root"},"Action":"kms:*","Resource":"*"}]}`

	kmskey.NewKmsKey(stack, jsii.String("Key"), &kmskey.KmsKeyProps{
		Context:              context,
		Alias:                jsii.String("alias/acme-dev-app-custom"),
		Description:          jsii.String("Comprehensive KMS key example — all props exercised"),
		EnableKeyRotation:    jsii.Bool(false),
		PendingWindowInDays:  jsii.Number(14),
		MultiRegion:          jsii.Bool(true),
		Policy:               jsii.String(policy),
	})

	app.Synth(nil)
}
