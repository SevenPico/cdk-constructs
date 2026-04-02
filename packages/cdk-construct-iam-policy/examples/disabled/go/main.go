package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	cdkcontext "github.com/sevenpico/cdk-constructs/cdkcontext"
	policy "github.com/sevenpico/cdk-constructs/cdkconstructiampolicy"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("IamPolicyDisabledStack"), nil)

	context := cdkcontext.ContextFns_Make(&cdkcontext.ContextProps{
		Namespace:   jsii.String("acme"),
		Environment: jsii.String("dev"),
		Stage:       jsii.String("app"),
		Enabled:     jsii.Bool(false),
	})

	policy.NewIamPolicy(stack, jsii.String("Policy"), &policy.IamPolicyProps{
		Context:          context,
		IamPolicyEnabled: jsii.Bool(true),
		PolicyStatements: &map[string]*policy.IamPolicyStatement{
			"AllowS3Read": {
				Effect:    jsii.String("Allow"),
				Actions:   &[]*string{jsii.String("s3:GetObject"), jsii.String("s3:ListBucket")},
				Resources: &[]*string{jsii.String("*")},
			},
		},
	})

	app.Synth(nil)
}
