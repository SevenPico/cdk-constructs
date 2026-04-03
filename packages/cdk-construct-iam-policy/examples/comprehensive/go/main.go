package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	cdkcontext "github.com/sevenpico/cdk-constructs/cdkcontext"
	policy "github.com/sevenpico/cdk-constructs/cdkconstructiampolicy"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("IamPolicyComprehensiveStack"), nil)

	context := cdkcontext.ContextFns_Make(&cdkcontext.ContextProps{
		Namespace:   jsii.String("acme"),
		Environment: jsii.String("dev"),
		Stage:       jsii.String("app"),
	})

	policy.NewIamPolicy(stack, jsii.String("Policy"), &policy.IamPolicyProps{
		Context:          context,
		IamPolicyEnabled: jsii.Bool(true),
		Description:      jsii.String("Acme application read/write policy"),
		PolicyStatements: &map[string]*policy.IamPolicyStatement{
			"AllowS3Read": {
				Effect:    jsii.String("Allow"),
				Actions:   &[]*string{jsii.String("s3:GetObject"), jsii.String("s3:ListBucket")},
				Resources: &[]*string{jsii.String("arn:aws:s3:::acme-dev-app-*"), jsii.String("arn:aws:s3:::acme-dev-app-*/*")},
			},
			"AllowDynamoDBWrite": {
				Effect:    jsii.String("Allow"),
				Actions:   &[]*string{jsii.String("dynamodb:PutItem"), jsii.String("dynamodb:UpdateItem"), jsii.String("dynamodb:GetItem")},
				Resources: &[]*string{jsii.String("arn:aws:dynamodb:us-east-1:123456789012:table/acme-dev-app-*")},
			},
			"DenyDelete": {
				Effect:    jsii.String("Deny"),
				Actions:   &[]*string{jsii.String("s3:DeleteObject"), jsii.String("dynamodb:DeleteItem")},
				Resources: &[]*string{jsii.String("*")},
			},
		},
	})

	app.Synth(nil)
}
