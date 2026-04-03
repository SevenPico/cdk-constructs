package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	cdkcontext "github.com/sevenpico/cdk-constructs/cdkcontext"
	secret "github.com/sevenpico/cdk-constructs/cdkconstructsecret"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("SecretWithSnsStack"), nil)

	context := cdkcontext.ContextFns_Make(&cdkcontext.ContextProps{
		Namespace:   jsii.String("acme"),
		Environment: jsii.String("dev"),
		Stage:       jsii.String("app"),
	})

	// Secret with SNS topic for change notifications, read principal, and description
	secret.NewSecret(stack, jsii.String("Secret"), &secret.SecretProps{
		Context:     context,
		Description: jsii.String("Application credentials with SNS notifications"),
		CreateSns:   jsii.Bool(true),
		SecretReadPrincipals: &[]secret.SecretReadPrincipal{
			{
				Type:        jsii.String("AWS"),
				Identifiers: &[]*string{jsii.String("arn:aws:iam::123456789012:role/acme-app-role")},
			},
		},
		SnsPubPrincipals: &[]secret.SecretReadPrincipal{
			{
				Type:        jsii.String("Service"),
				Identifiers: &[]*string{jsii.String("secretsmanager.amazonaws.com")},
			},
		},
		SnsSubPrincipals: &[]secret.SecretReadPrincipal{
			{
				Type:        jsii.String("AWS"),
				Identifiers: &[]*string{jsii.String("arn:aws:iam::123456789012:role/acme-ops-role")},
			},
		},
	})

	app.Synth(nil)
}
