package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/jsii-runtime-go"
	cdkcontext "github.com/sevenpico/cdk-constructs/cdkcontext"
	role "github.com/sevenpico/cdk-constructs/cdkconstructiamrole"
)

func main() {
	app := awscdk.NewApp(nil)
	stack := awscdk.NewStack(app, jsii.String("IamRoleComprehensiveStack"), nil)

	context := cdkcontext.ContextFns_Make(&cdkcontext.ContextProps{
		Namespace:   jsii.String("acme"),
		Environment: jsii.String("dev"),
		Stage:       jsii.String("app"),
	})

	policyDoc := `{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":["s3:GetObject","s3:PutObject"],"Resource":"arn:aws:s3:::acme-dev-app-*/*"}]}`

	role.NewIamRole(stack, jsii.String("Role"), &role.IamRoleProps{
		Context:         context,
		RoleDescription: jsii.String("Acme EC2 instance role with S3 access"),
		Principals: &map[string]*[]*string{
			"Service": {jsii.String("ec2.amazonaws.com")},
		},
		ManagedPolicyArns:      &[]*string{jsii.String("arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore")},
		InstanceProfileEnabled: jsii.Bool(true),
		MaxSessionDuration:     jsii.Number(7200),
		PolicyDocuments:        &[]*string{jsii.String(policyDoc)},
	})

	app.Synth(nil)
}
